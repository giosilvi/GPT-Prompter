import promptGPT3Prompting from "./gpt3.js";
import symbolFromModel from "./sharedfunctions.js";
import {CHAT_API_MODELS} from "./gpt3.js";

const std_model = "gpt-4-turbo";


// FUNCTIONS DECLARATION
async function checkGPT(apikey) {
  // Get the API key from storage
  chrome.storage.sync.get("APIKEY", async function (items) {
    // Set the URL for the OpenAI models endpoint
    const url = "https://api.openai.com/v1/models";
    // Make a GET request to the endpoint with the provided API key
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey,
      },
    });
    // If the request was successful, parse the response as JSON
    if (response.ok) {
      const result = await response.json();
      // Send a message to the runtime indicating that the API_key_valid
      chrome.runtime.sendMessage({ message: "API_key_valid" });
      return result;
    } else {
      // If the request was not successful, send a message to the runtime indicating that the API_key_invalid
      chrome.runtime.sendMessage({ message: "API_key_invalid" });
      return false;
    }
  });
}

//add a function to check if the API key is present in storage, if not set black icon
function checkAPIKey() {
  chrome.storage.sync.get("APIKEY", function (items) {
    // Check that the API key exists
    if (typeof items.APIKEY == "undefined") {
      // run your script from here
      chrome.action.setIcon({ path: "icons/icon16.png" });
    }
  });
}

//Function to create context menu, erasing the previous one
function createContextMenu() {
  // Remove existing context menus
  chrome.contextMenus.removeAll();

  // Create new context menu
  chrome.contextMenus.create({
    id: "GPT-Prompter",
    title: "GPT-Prompter",
    documentUrlPatterns: ["https://*/*", "http://*/*", "file:///*"],
    contexts: ["all"],
  });

  // Create sub-context menu for prompt on the fly
  chrome.contextMenus.create({
    id: "ChatGPT",
    title: "🤖 ChatGPT",
    parentId: "GPT-Prompter",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "On-the-Fly",
    title: "⚡️ Prompt On-the-Fly ",
    parentId: "GPT-Prompter",
    contexts: ["all"],
  });

  // Create a separator
  chrome.contextMenus.create({
    id: "separator",
    type: "separator",
    parentId: "GPT-Prompter",
    contexts: ["all"],
  });

  // Retrieve list of custom prompts from storage
  chrome.storage.local.get("customprompt", function (items) {
    if (items.customprompt) {
      // Create a context menu for each custom prompt
      items.customprompt.forEach((prompt, index) => {
        const symbol = symbolFromModel(prompt.model);
        chrome.contextMenus.create({
          id: `customprompt-${index}`,
          parentId: "GPT-Prompter",
          title: passTitleOrPrompt(prompt, symbol),
          contexts: ["all"],
        });
      });
    }
  });
}

function passTitleOrPrompt(customprompt, symbol) {
  // if the customprompt.twoStage is true,add a 2 stage symbol
  if (customprompt.twoStage) {
    symbol = symbol + " ⏩";
  }
  // if customprompt contains  a title return the title
  if (customprompt.title) {
    return `${symbol} ${customprompt.title.replaceAll("#TEXT#", "%s")}`;
  } else {
    // if customprompt does not contain a title return the prompt
    if (customprompt.model in CHAT_API_MODELS) {
      // if it is, json parse the prompt
      const prompt = JSON.parse(customprompt.prompt);
      // get the last element of the prompt
      const lastElement = prompt[prompt.length - 1];
      return `${symbol} ${lastElement["content"].replaceAll("#TEXT#", "%s")}`;
    } else {
      return `${symbol} ${customprompt.prompt.replaceAll("#TEXT#", "%s")}`;
    }
  }
}

// LISTENER DECLARATION

// Initial context menu creation, on install
chrome.runtime.onInstalled.addListener(function (details) {
  // if (details.reason === "install") {
  //     chrome.action.openPopup(); // open popup not a function, but is in documentation
  //   }
  checkAPIKey();
  transferCustomPrompts();
  // add one prompt to the storage
  chrome.storage.local.get("customprompt", function (items) {
    // Check that the prompt exists
    if (typeof items.customprompt !== "undefined") {
      // check if customprompt is a list of strings
      if (items.customprompt.length > 0 && typeof items.customprompt[0] === "string") {
        console.log("Fixing the prompt list");
        //loop over the list of prompts
        for (var i = 0; i < items.customprompt.length; i++) {
          // modify each one of them to become a dictionary
          items.customprompt[i] = {
            model: "gpt-4-turbo",
            temperature: 0.1,
            max_tokens: 1024,
            prompt: items.customprompt[i],
            twoStage: false,
          };
        }
      }
    } else {
      // if the prompt does not exist, create the default one
      items.customprompt = [
        {
          model: "gpt-4-turbo",
          temperature: 0.1,
          max_tokens: 4096,
          prompt:  JSON.stringify([{"role":"user", "content":"Try not to use headings.. Tell me more about #TEXT#:"}]),
          twoStage: false,
        },
        {
          model: "gpt-4-turbo",
          temperature: 0.1,
          max_tokens: 4096,
          prompt:  JSON.stringify([{"role":"user", "content":"Please create an Anki card for: #TEXT#:"}]),
          twoStage: false,
        },
        {
          model: "gpt-4-turbo",
          temperature: 0.1,
          max_tokens: 4096,
          prompt:  JSON.stringify([{"role":"user", "content":"Please create an Anki card for the concept below. Explain any intuitions and be sure to include formulas if necessary: #TEXT#"}]),
          twoStage: false,
        },
        {
          model: "gpt-4-turbo",
          temperature: 0.1,
          max_tokens: 1024,
          prompt:
          JSON.stringify([{"role":"user", "content":"Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below, say 'I don\'t know' \nContext:\n#TEXT# \n\nQ:"}]),
          title: "Two-stage Q&A",
          twoStage: true,
        }
      ];
    }
    // save the newPromptList
    chrome.storage.local.set({ customprompt: items.customprompt });
    // create the context menu
    createContextMenu();
  });
  chrome.storage.sync.get("advancedSettings", function (items) {
    // Check that the advancedSettings exists
    if (typeof items.advancedSettings == "undefined") {
      // set advancedSettings as a dictionary
      items.advancedSettings = {};
    }
    // save
    chrome.storage.sync.set({ advancedSettings: items.advancedSettings });
  });
});

// Listen for a signal to refresh the context menu
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  // If the signal is to refresh the context menu
  if (message.text === "newPromptList") {
    createContextMenu();
  }
  // If the signal is to check the API key
  else if (message.text === "checkAPIKey") {
    (async () => {
      const result = await checkGPT(message.apiKey);
    })();
  }
  // If the signal is to launch GPT
  else if (message.text === "launchGPT") {
    // Get the tab from the sender
    const { tab } = sender; // this line is equivalent to const tab = sender.tab;
    console.log("Received prompt object.");
    console.log(typeof message.prompt.prompt, message.prompt);
    // Launch GPT
    chrome.storage.sync.get("APIKEY", function (items) {
      (async () => {
        await promptGPT3Prompting(message.prompt, items, tab);
      })();
    });
  } else if (message.action === "transcribeAudio") {
    console.log("Transcribing audio");
    transcribeWithWhisper(message.audio)
      .then((resp) => sendResponse({ data: resp.text }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Required to use sendResponse asynchronously
  } else {
    console.log("Unknown message: ", message);
  }
});

// The following code will first disable the context menu item with ID "GPT-Prompter" when the active tab is changed or reloaded.
// Then it will check if the new tab is complete, if it is, it will send a message to the content script of the new tab
// with the message "shouldReenableContextMenu" and a callback function that will handle the response from the content script.

let contextMenuEnabled = true;
function updateContextMenu(tab) {
  chrome.contextMenus.update("GPT-Prompter", { enabled: false });
  // console.log('Check if content script is running...');
  contextMenuEnabled = false;
  // if the tab is complete, send a message to the content script to check if the context menu should be re-enabled
  chrome.tabs.sendMessage(tab.id, { greeting: "shouldReenableContextMenu" }, function (response) {
    if (response && response.farewell === "yes") {
      chrome.contextMenus.update("GPT-Prompter", { enabled: true });
      contextMenuEnabled = true;
    } else if (chrome.runtime.lastError) {
      contextMenuEnabled = false;
    } else {
      console.log("Error.");
    }
  });
  return contextMenuEnabled;
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].status === "complete") {
      contextMenuEnabled = updateContextMenu(tabs[0]);
    }
  });
});
// on Updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    contextMenuEnabled = updateContextMenu(tab);
  }
});

function replacePlaceHolder(selectionText) {
  // if there is a text /#TEXT#/g inside selectionText replace with nothing, and use the position to set the cursor later
  if (typeof selectionText == "undefined") {
    selectionText = "";
  }
  var cursorPosition = selectionText.search(/#TEXT#/g);
  if (cursorPosition !== -1) {
    selectionText = selectionText.replace(/#TEXT#/g, "");
  }
  return [selectionText, cursorPosition];
}

function launchPopUpInPage(selectionText, prompt, command) {
  // replace the placeholder
  if (command == "showPopUpOnTheFly") {
    var [selectionText, cursorPosition] = replacePlaceHolder(selectionText);
  } else if (command == "showPopUpChatGPT") {
    // loop over the selectionText and replace the placeholder
    for (var i = 0; i < selectionText.length; i++) {
      var [contentText, cursorPosition] = replacePlaceHolder(selectionText[i]["content"]);

      selectionText[i]["content"] = contentText;
    }
  } else {
    console.error("Unknown command: ", command);
  }

  // if prompt is not null, use it
  if (prompt !== null) {
    var model = prompt["model"];
    var temperature = prompt["temperature"];
    var max_tokens = prompt["max_tokens"];
    // make the bodyData
    var bodyData = {
      model: model,
      temperature: temperature,
      max_tokens: max_tokens,
    };
  } else {
    // if prompt is null, use the default one
    var bodyData = {
      model: std_model,
      temperature: 0.1,
      max_tokens: 1024,
    };
  }
  // here we want to create a minipop-up to ask the user to insert the prompt
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      message: command,
      text: selectionText,
      bodyData: bodyData,
      cursorPosition: cursorPosition,
    });
  });
}

function defaultChatPrompt(selectionText) {
  var chatPrompt = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: selectionText },
  ];
  return chatPrompt;
}

// Shortcut to launch the prompt on the fly
chrome.commands.onCommand.addListener(function (command) {
  // if command is prompt-on-the-fly, and the context menu is enabled, launch the prompt on the fly
  console.log("Command: " + command + " Context menu enabled: " + contextMenuEnabled);
  if (contextMenuEnabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Get the current tab
      var tab = tabs[0];
      // Send a message to the content script
      if (command === "prompt-on-the-fly") {
        chrome.tabs.sendMessage(tab.id, { getSelection: true }, function (response) {
          launchPopUpInPage(response.selection, null, "showPopUpOnTheFly");
        });
      } else if (command === "chatGPT") {
        chrome.tabs.sendMessage(tab.id, { getSelection: true }, function (response) {
          launchPopUpInPage(defaultChatPrompt(response.selection), null, "showPopUpChatGPT");
        });
      }
    });
  } else {
    //send a message to the content script to show a notification
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //catch the error if the content script is not running
      chrome.tabs.sendMessage(tabs[0].id, "GPT-Prompter: Content script not yet running. Wait for the page to load.", function (response) {
        if (chrome.runtime.lastError) {
          console.log("Content script not available");
        }
      });
    });
  }
});

// Listen for clicks on context menu items
chrome.contextMenus.onClicked.addListener(async (info, tabs) => {
  // Check if the API key is present in storage
  const { APIKEY } = await new Promise((resolve) => {
    chrome.storage.sync.get("APIKEY", resolve);
  });
  // If the API key is not found, send a message to the tab and return early
  if (typeof APIKEY === "undefined") {
    chrome.tabs.sendMessage(
      tabs.id,
      "GPT-Prompter: \n API KEY not found. Click on the extension icon to set it. \n (Top right corner of the browser -> puzzle piece icon -> GPT-Prompter)"
    );
    return;
  }

  // If the clicked context menu item is a custom prompt
  if (info.menuItemId.startsWith("customprompt-")) {
    // Extract the prompt number from the menu item's ID
    const promptNumber = parseInt(info.menuItemId.replace("customprompt-", ""), 10);
    // Retrieve the list of custom prompts from storage
    chrome.storage.local.get("customprompt", (items) => {
      // Check that the list of custom prompts exists
      if (Array.isArray(items.customprompt)) {
        // Check that the prompt number is valid
        if (promptNumber <= items.customprompt.length) {
          // Get the prompt object
          const prompt = items.customprompt[promptNumber];
          // Update the prompt text with the selected text, if there is any
          var parsedPrompt = "";
          if (prompt.model in CHAT_API_MODELS) {
            parsedPrompt = JSON.parse(prompt.prompt);
            prompt.prompt = parsedPrompt;
          }
          if (info.selectionText) {
            if (prompt.model in CHAT_API_MODELS) {
              // loop over the prompt and replace the placeholder
              for (var i = 0; i < parsedPrompt.length; i++) {
                if (parsedPrompt[i]["content"].includes("#TEXT#")) {
                  parsedPrompt[i]["content"] = parsedPrompt[i]["content"].replace(/#TEXT#/g, info.selectionText);
                }
              }
              prompt.prompt = parsedPrompt;
            } else {
              prompt.prompt = prompt.prompt.replace(/#TEXT#/g, info.selectionText);
            }
          }
          if (!prompt.twoStage && info.selectionText) {
            // Send a message to the content script to show the popup
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, { message: "showPopUp" });
            });
            // Get the APIKEY from storage
            chrome.storage.sync.get("APIKEY", function (items) {
              // Launch the prompt
              (async () => {
                console.log("PROMPT:",prompt, items, tabs);
                await promptGPT3Prompting(prompt, items, tabs);
              })();
            });
          } else {
            if (prompt.model in CHAT_API_MODELS) {
              console.log("Chat GPT", prompt);
              launchPopUpInPage(prompt.prompt, prompt, "showPopUpChatGPT");
            } else {
              launchPopUpInPage(prompt.prompt, prompt, "showPopUpOnTheFly");
            }
          }
        } else {
          // If the prompt number is invalid, send an error message to the tab and log a message to the console
          chrome.tabs.sendMessage(tabs.id, "Error: invalid prompt number");
        }
      } else {
        // If the list of custom prompts does not exist, send an error message to the tab and log a message to the console
        chrome.tabs.sendMessage(tabs.id, "Error: no prompt list found");
      }
    });
  }
  // If the clicked context menu item is the "On-the-Fly" prompt
  else if (info.menuItemId === "On-the-Fly") {
    // Launch the "On-the-Fly" prompt with the selected text and the current tabs object
    launchPopUpInPage(info.selectionText, null, "showPopUpOnTheFly");
  } else if (info.menuItemId === "ChatGPT") {
    const chatPrompt = defaultChatPrompt(info.selectionText);
    launchPopUpInPage(chatPrompt, null, "showPopUpChatGPT");
  }
});

// create Context Menu every time browser starts
chrome.runtime.onStartup.addListener(function () {
  transferCustomPrompts(); // TURN OFF FIRST
  // sync custom prompts
  createContextMenu();
});

function transferCustomPrompts() {
  console.log("Transferring custom prompts from sync to local storage...");
  chrome.storage.sync.get("customprompt", function (syncItems) {
    if (typeof syncItems.customprompt !== "undefined") {
      chrome.storage.local.get("customprompt", function (localItems) {
        if (typeof localItems.customprompt === "undefined") {
          localItems.customprompt = [];
        }
        // copy custom prompts from sync storage to local storage
        for (var i = 0; i < syncItems.customprompt.length; i++) {
          var prompt = syncItems.customprompt[i];
          if (!promptExists(prompt, localItems.customprompt)) {
            localItems.customprompt.push(prompt);
          }
        }
        // save custom prompts to local storage
        chrome.storage.local.set({ customprompt: localItems.customprompt }, function () {
          console.log("Custom prompts were successfully transferred from sync to local storage.");
        });
      });
    }
  });
}

// helper function to check if a prompt exists in an array of prompts
function promptExists(prompt, promptList) {
  for (var i = 0; i < promptList.length; i++) {
    if (
      promptList[i].model === prompt.model &&
      promptList[i].temperature === prompt.temperature &&
      promptList[i].max_tokens === prompt.max_tokens &&
      promptList[i].prompt === prompt.prompt
    ) {
      return true;
    }
  }
  return false;
}

// Whisper API functions

async function transcribeWithWhisper(wavUrl) {
  return new Promise(async (resolve, reject) => {
    
    // const audio = new Blob([wavBuffer], { type: "audio/wav" });
    const wavBlob = await getBlobFromObjectUrl(wavUrl);
    const formData = new FormData();
    formData.append("file", wavBlob, "audio.wav");
    formData.append("model", "whisper-1");
  
    chrome.storage.sync.get("APIKEY", async function (items) {
      try {
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${items.APIKEY}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Success:", data);
          resolve(data);
        } else {
          const error = await response.text();
          console.error("Error:", error);
          reject(new Error(error));
        }
      } catch (e) {
        console.error("Error in fetch:", e);
        reject(e);
      }
    });
  });
}

async function getBlobFromObjectUrl(objectUrl) {
  const response = await fetch(objectUrl);
  const blob = await response.blob();
  return blob;
}
