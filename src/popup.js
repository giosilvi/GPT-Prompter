// GENERAL FUNCTIONS
import {CHAT_API_MODELS} from "./gpt3.js";

function makePromptList(items) {
  // Clear the node 'list-of-prompts'.
  var ul = document.getElementById("list-of-prompts");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  var titleExists = false;
  for (var i = 0; i < items.customprompt.length; i++) {
    var li = document.createElement("li");
    li.className = "list-group-item draggable list-group-item-action";
    li.setAttribute("draggable", "true");
    li.setAttribute("id", i);

    // Create text elements for title, prompt, model, temperature

    // check if title exists
    if (items.customprompt[i]["title"] != undefined && items.customprompt[i]["title"] != "") {
      var titleText = document.createElement("span");
      titleText.className = "feature-text";
      titleText.innerText = ` ${items.customprompt[i]["title"]}`;
      titleText.setAttribute("data-title", "Title:");
      titleExists = true;
    } else {
      titleExists = false;
    }

    var modelText = document.createElement("span");
    modelText.className = "feature-text";
    modelText.innerText = items.customprompt[i]["model"];
    modelText.setAttribute("data-title", "Model: ");

    var promptText = document.createElement("span");
    promptText.className = "prompt-text";
    var type = "GPT";
    if (modelText.innerText in CHAT_API_MODELS) {
      type = "ChatGPT";
    }
    if (type == "ChatGPT") {
      let messages = JSON.parse(items.customprompt[i]["prompt"]);
      // loop over messages and add them to the promptText, each has a field role and content
      for (let i = 0; i < messages.length; i++) {
        promptText.innerHTML += messages[i]["role"] + ": " + messages[i]["content"] + "<br>";
      }
    } else {
      promptText.innerText = items.customprompt[i]["prompt"];
    }

    var tempText = document.createElement("span");
    tempText.className = "feature-text";
    tempText.style.marginLeft = "25px";
    tempText.innerText = ` ${items.customprompt[i]["temperature"]}`;
    tempText.setAttribute("data-title", "Temp:");


    // Create Add title , edit and delete buttons
    var titleButton = document.createElement("button");
    titleButton.className = "save";
    if (titleExists) {
      titleButton.innerText = "Edit Title";
    } else {
      titleButton.innerText = "Add Title";
    }
    titleButton.setAttribute("id", `title${i}`);

    var editButton = document.createElement("button");
    editButton.className = "save";
    editButton.innerText = "Edit Prompt";
    editButton.setAttribute("id", `edit${i}`);

    var deleteButton = document.createElement("button");
    deleteButton.className = "save";
    deleteButton.innerText = "Delete";
    deleteButton.setAttribute("id", `del${i}`);
    // add a toggle to make the prompt Two-Stage or not
    var twoStageToggle = document.createElement("input");
    twoStageToggle.setAttribute("type", "checkbox");
    twoStageToggle.setAttribute("id", `twoStage${i}`);
    twoStageToggle.setAttribute("name", `twoStage${i}`);
    // read the value of the checkbox from the storage
    if (items.customprompt[i]["twoStage"] == true) {
      twoStageToggle.setAttribute("checked", "checked");
    }
    // add text to the toggle
    var twoStageToggleText = document.createElement("span");
    if (type == "ChatGPT") {
      twoStageToggleText.innerText = "Always open in Chat";
    } else {
      twoStageToggleText.innerText = "Two-Stage mode";
    }
    twoStageToggleText.style.marginLeft = "10px";
    twoStageToggleText.style.marginRight = "10px";
    // add title that appears on hover
    twoStageToggleText.setAttribute(
      "title",
      "Two-Stage mode: the prompt is loaded with the selected text but is not sent immediately so the user can add to it."
    );

    // Add a textare for the title, make it hidden, make it one line, and 500px wide
    var titleInsertText = document.createElement("textarea");
    titleInsertText.className = "title-text form-control";
    titleInsertText.setAttribute("id", `title-text${i}`);
    titleInsertText.style.display = "none";
    titleInsertText.setAttribute("rows", "1");
    titleInsertText.setAttribute("cols", "60");
    titleInsertText.setAttribute("placeholder", "Enter title here (click away to save)");

    // Append all elements to the list item
    li.appendChild(titleInsertText);
    if (titleExists) {
      li.appendChild(titleText);
      li.appendChild(document.createElement("br"));
    }
    li.appendChild(promptText);
    li.appendChild(document.createElement("br"));
    li.appendChild(modelText);
    li.appendChild(tempText);
    li.appendChild(document.createElement("br"));
    li.appendChild(titleButton);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    li.appendChild(twoStageToggle);
    li.appendChild(twoStageToggleText);
    li.appendChild(document.createElement("br"));

    if (type == "ChatGPT") {
      // make the node border green
      li.style.border = "1px solid green";
    }
    // Append the list item to the 'list-of-prompts' node
    ul.appendChild(li);

    // Call the addEventsDragAndDrop function with the list item as the parameter
    addEventsDragAndDrop(li);
  }
  updateLowerButtons(items);
}

function updateLowerButtons(items) {
  items.customprompt.forEach((prompt, index) => {
    const id = index.toString();

    const addTitleButton = document.getElementById(`title${id}`);
    addTitleButton.addEventListener("click", () => {
      addTitle(id);
    });

    const editButton = document.getElementById(`edit${id}`);
    editButton.addEventListener("click", () => {
      editPrompt(id);
    });

    const deleteButton = document.getElementById(`del${id}`);
    deleteButton.addEventListener("click", () => {
      const element = document.getElementById(id);
      element.classList.add("hide");
      setTimeout(() => {
        erasePrompt(id);
      }, 600);
    });
    // add a listener to the checkbox Two-Stage mode
    const twoStageToggle = document.getElementById(`twoStage${id}`);
    twoStageToggle.addEventListener("click", () => {
      toggleTwoStage(id);
    });
  });
}

function toggleTwoStage(id) {
  getFromStorage("customprompt", true).then((items) => {
    items.customprompt[id]["twoStage"] = !items.customprompt[id]["twoStage"]; // toggle the value
    setInStorage({ customprompt: items.customprompt }, true);
    setInStorage({ customprompt: items.customprompt });
    // send the signal to update context menu
    chrome.runtime.sendMessage({ text: "newPromptList" });
  });
}

function toggleSaveKeyButton() {
  const apiKeyInput = document.getElementById("apikey");
  const saveKeyButton = document.getElementById("saveKey");
  const deleteKeyButton = document.getElementById("deleteKey");
  const linkToAPI = document.getElementById("linkToAPI");
  const linkToGuide = document.getElementById("linkToGuide");
  const showKeyButton = document.getElementById("showKey");

  if (apiKeyInput.style.display === "none") {
    apiKeyInput.style.display = "block";
    saveKeyButton.style.display = "block";
    deleteKeyButton.style.display = "block";
    linkToAPI.style.display = "block";
    linkToGuide.style.display = "none";
    showKeyButton.innerHTML = "Hide API";

    getFromStorage("APIKEY").then((items) => {
      if (typeof items.APIKEY !== "undefined") {
        apiKeyInput.value = items.APIKEY;
      }
    });
  } else {
    apiKeyInput.style.display = "none";
    saveKeyButton.style.display = "none";
    deleteKeyButton.style.display = "none";
    linkToAPI.style.display = "none";
    linkToGuide.style.display = "block";
    showKeyButton.innerHTML = "Show API";
  }
}

function hideSaveKey() {
  //hide the element with id 'apikey' and the 'saveKey' button
  document.getElementById("apikey").style.display = "none";
  document.getElementById("saveKey").style.display = "none";
  document.getElementById("deleteKey").style.display = "none";
  document.getElementById("linkToAPI").style.display = "none";
  document.getElementById("linkToGuide").style.display = "block";
  document.getElementById("showKey").style.display = "block";
  document.getElementById("showKey").innerHTML = "Show API";
}
function addChatGPTPH() {
  // get the element systeminput- with the highest number
  var highest = 0;
  var highestElement = null;
  var elements = document.getElementsByClassName("systeminput");
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var id = element.id;
    var num = id.replace("systeminput-", "");
    if (num > highest) {
      highest = num;
      highestElement = element;
    }
  }
  // add #TEXT# to the prompt, where the cursor is
  var input = highestElement;

  // var input = document.getElementById("promptinput");
  var start = input.selectionStart;
  var end = input.selectionEnd;
  var text = input.value;
  var before = text.substring(0, start);
  var after = text.substring(end, text.length);
  input.value = before + "#TEXT#" + after;
  input.focus();
  input.selectionStart = start + 6;
  input.selectionEnd = start + 6;
  //
  toggleHiddenCreateAndPHChatGPT(true);
}

function addPH() {
  // add #TEXT# to the prompt, where the cursor is
  var input = document.getElementById("promptinput");
  var start = input.selectionStart;
  var end = input.selectionEnd;
  var text = input.value;
  var before = text.substring(0, start);
  var after = text.substring(end, text.length);
  input.value = before + "#TEXT#" + after;
  input.focus();
  input.selectionStart = start + 6;
  input.selectionEnd = start + 6;
  //
  toggleHiddenCreateAndPH(true);
}

function getTextforPrompt(type) {
  if (type == "ChatGPT") {
    // get all elements with class systeminput
    var elements = document.getElementsByClassName("systeminput");
    // get the assistantOrUser-
    var assistantOrUser = document.getElementsByClassName("assistantOrUser");
    // create a json object. for example:
    // {"role": "system", "content": "You are a helpful assistant."},
    // {"role": "user", "content": "Who won the world series in 2020?"},
    // {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
    // {"role": "user", "content": "Where was it played?"}
    // role can be read from the value of the elements assistantOrUser-
    // content can be read from the value of the elements button systeminput-
    // system can be read from the value of systeminput
    let systeminput = document.getElementById("systeminput").value;
    var json = [{ role: "system", content: systeminput }];
    for (var i = 0; i < elements.length; i++) {
      var content = elements[i].value;
      var role = assistantOrUser[i].innerText;
      json.push({ role: role, content: content });
    }
    // convert the json object to a string
    var jsonstring = JSON.stringify(json);
    return jsonstring;
  } else if (type == "GPT") {
    return document.getElementById("promptinput").value;
  }
}

//add function to save the the custom prompt in storage
function savePrompt(type) {
  console.log("savePrompt");
  var textAreaToSendMessage = null;
  var buttonToDisable = null;
  if (type == "ChatGPT") {
    textAreaToSendMessage = document.getElementById("systeminput");
    buttonToDisable = document.getElementById("createChatGPTPrompt");
  } else if (type == "GPT") {
    textAreaToSendMessage = document.getElementById("promptinput");
    buttonToDisable = document.getElementById("createPrompt");
  } else {
    console.log("error in savePrompt");
  }
  var previousmessage = textAreaToSendMessage.value;
  buttonToDisable.disabled = true;

  // get the text from the prompt
  var model = document.getElementById("inputmodel").value;
  var temp = parseFloat(document.getElementById("temp").value);
  var text = getTextforPrompt(type);
  var bodyData = {
    model: model,
    temperature: temp,
    prompt: text,
    stream: true,
    twoStage: false,
    title: "",
    type: type,
  };
  // try to retrive the custom prompt from the storage API
  getFromStorage("customprompt", true).then((items) => {
    // Check that the prompt exists
    if (typeof items.customprompt !== "undefined") {
      var prompt_already_present = false;
      // check that the prompt is not already present, looping over every prompt in the array and comparing each values in the dictionary
      for (var i = 0; i < items.customprompt.length; i++) {
        if (
          items.customprompt[i]["prompt"] == text &&
          items.customprompt[i]["model"] == model &&
          items.customprompt[i]["temperature"] == temp 
        ) {
          prompt_already_present = true;
        }
      }

      if (prompt_already_present == false) {
        items.customprompt.push(bodyData);
        makePromptList(items); //update the list of prompts
        setInStorage({ customprompt: items.customprompt }, true);
        setInStorage({ customprompt: items.customprompt });
        chrome.runtime.sendMessage({ text: "newPromptList" });

        textAreaToSendMessage.value = "Prompt created! Available in context menu (right click).";
        textAreaToSendMessage.style.color = "#10a37f"; //green color for the prompt created
      } else {
        console.log("Your custom prompt was already saved.");
        textAreaToSendMessage.value = "Prompt already present! Available in context menu (right click).";
        //yellow color for the prompt created
        textAreaToSendMessage.style.color = "#f7b500";
      }
      setTimeout(function () {
        textAreaToSendMessage.value = previousmessage;
        textAreaToSendMessage.style.color = "#495057"; //exadecimal standard color
        buttonToDisable.disabled = false;
        if (!prompt_already_present) {
          document.getElementById("yourPromptsBody").classList.remove("collapse");
          //focus on the last element of the list
          var list = document.getElementById("list-of-prompts");
          console.log(list.lastElementChild, "focus");
          list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "start"});
          // after the scroll, highlight the element
          list.lastElementChild.style.backgroundColor = "#72afa0";
          setTimeout(function () {
            list.lastElementChild.style.backgroundColor = "#fff";
          }, 2000);
        }
      }, 2000);
    } else {
      // if the prompt does not exist, create a new array with the prompt
      items.customprompt = [bodyData];
    }
  });
}

//add a function to erase a custom prompt from the storage API provided the index of the prompt
async function erasePrompt(index) {
  try {
    const items = await getFromStorage("customprompt", true);

    if (items && items.customprompt && index < items.customprompt.length) {
      items.customprompt.splice(index, 1); // splice: remove 1 element at index
      await setInStorage({ customprompt: items.customprompt }, true);
      await setInStorage({ customprompt: items.customprompt });

      makePromptList(items);
      console.log("Your custom prompt was erased.");

      chrome.runtime.sendMessage({ text: "newPromptList" });
    }
  } catch (error) {
    console.error(error);
  }
}

async function getFromStorage(key, useLocalStorage = false) {
  return new Promise((resolve, reject) => {
    if (useLocalStorage) {
      chrome.storage.local.get(key, (items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(items);
        }
      });
    } else {
      chrome.storage.sync.get(key, (items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(items);
        }
      });
    }
  });
}

async function setInStorage(items, useLocalStorage = false) {
  return new Promise((resolve, reject) => {
    if (useLocalStorage) {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } else {
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError); // reject the promise with the error
        } else {
          resolve(); // resolve the promise, which means the function resolve() will be called, it will be the .then() function
        }
      });
    }
  });
}

function addTitle(index) {
  let textTitle = document.getElementById(`title-text${index}`);
  textTitle.style.display = "block";
  textTitle.focus();
  textTitle.addEventListener("blur", function () {
    saveTitle(index);
    textTitle.style.display = "none";
    chrome.runtime.sendMessage({ text: "newPromptList" });
  });
}

async function saveTitle(index) {
  // get the text from the title
  var title = document.getElementById(`title-text${index}`).value;
  // try to retrive the custom prompt from the storage API
  try {
    const items = await getFromStorage("customprompt", true);

    if (items && items.customprompt && index < items.customprompt.length) {
      // add the title to the prompt
      items.customprompt[index]["title"] = title;
      // save the title in the storage, use SetInStorage function
      await setInStorage({ customprompt: items.customprompt }, true);
      await setInStorage({ customprompt: items.customprompt });

      makePromptList(items); //update the list of prompts
    }
  } catch (error) {
    console.error(error);
  }
}

function editPrompt(index) {
  getFromStorage("customprompt", true).then((items) => {
    // Check that the prompt exists
    if (typeof items.customprompt !== "undefined") {
      // check that the index is valid
      if (index <= items.customprompt.length) {
        // copy the prompt from the array to the input

        document.getElementById("inputmodel").value = items.customprompt[index]["model"];
        document.getElementById("temp").value = items.customprompt[index]["temperature"];
        document.getElementById("temperature").value = items.customprompt[index]["temperature"];
        if (items.customprompt[index]["model"] in CHAT_API_MODELS) {
          chatGPTDesignON();
          let listMessages = JSON.parse(items.customprompt[index]["prompt"]);
          document.getElementById("systeminput").value = listMessages[0]["content"];

          // leave only the first child of the message container
          const messageContainer = document.getElementById("message-container");
          while (messageContainer.lastChild.id != "message-row-1") {
            messageContainer.removeChild(messageContainer.lastChild);
            // reset messageCount
            messageCount = 1;
          }

          // the first message is added by default, content goes into the value of systeminput-1 and the role is set to innerText of assistantOrUser-1
          document.getElementById("systeminput-1").value = listMessages[1]["content"];
          document.getElementById("assistantOrUser-1").innerText = listMessages[1]["role"];
          // for each message in the list, add it to the chat creating the necessary element
          for (let i = 2; i < listMessages.length; i++) {
            console.log(listMessages[i]);
            // click add message button , pass the role and the content
            document.getElementById("addChatGPTMessage").click();
            document.getElementById("systeminput-" + i).value = listMessages[i]["content"];
            document.getElementById("assistantOrUser-" + i).innerText = listMessages[i]["role"];
          }
          // check if #TEXT# is present in any of the messages
          selfCheck();
        } else {
          GPTDesignON();
          // create an event input for the element promptinput
          var event = new Event("keyup", { bubbles: true });
          // remove collapse from promptDesignBody
          
         

          document.getElementById("promptinput").value = items.customprompt[index]["prompt"];
          // propage the event
          document.getElementById("promptinput").dispatchEvent(event);
        }

        // scroll to the promptDesignBody into view
        promptDesignBody = document.getElementById("promptDesignBody");
        promptDesignBody.classList.remove("collapse");
        promptDesignBody.scrollIntoView({ behavior: "smooth", block: "start"});
      }
    }
  });
}

function saveKey() {
  // Get a value saved in an input
  var apiKey = document.getElementById("apikey").value;
  // Save it using the Chrome extension storage API, use SetInStorage function
  setInStorage({ APIKEY: apiKey });
}


// redo the same for autoAddToggle
function addListenerToAutoAddToggle() {
  getFromStorage("advancedSettings").then((items) => {
    // Check that the advanced setting  exists
    if (typeof items.advancedSettings !== "undefined") {
      // Check that the autoAdd exists
      if (typeof items.advancedSettings.autoAdd !== "undefined") {
        // set the value of the autoAddToggle
        document.getElementById("autoAddToggle").checked = items.advancedSettings.autoAdd;
      }
    }
  });
  document.getElementById("autoAddToggle").addEventListener("click", function () {
    var autoAddToggle = document.getElementById("autoAddToggle").checked;
    // retrieve advancedSettings from the storage
    getFromStorage("advancedSettings").then((items) => {
      // add autoAddToggle to the advancedSettings
      items.advancedSettings.autoAdd = autoAddToggle;
      // save the value in the storage
      setInStorage({ advancedSettings: items.advancedSettings });
    });
  });
}

function toggleHiddenCreateAndPH(showCreatePrompt) {
  // if one is hidden, show it and hide the other, use setAttribute function
  if (showCreatePrompt) {
    document.getElementById("createPrompt").removeAttribute("hidden");
    document.getElementById("addPlaceHolder").setAttribute("hidden", "true");
  } else {
    document.getElementById("createPrompt").setAttribute("hidden", "true");
    document.getElementById("addPlaceHolder").removeAttribute("hidden");
  }
}

function toggleHiddenCreateAndPHChatGPT(showCreatePrompt) {
  // if one is hidden, show it and hide the other, use setAttribute function
  if (showCreatePrompt) {
    document.getElementById("createChatGPTPrompt").removeAttribute("hidden");
    document.getElementById("addChatGPTPlaceHolder").setAttribute("hidden", "true");
  } else {
    document.getElementById("createChatGPTPrompt").setAttribute("hidden", "true");
    document.getElementById("addChatGPTPlaceHolder").removeAttribute("hidden");
  }
}

function checkInputOfPromptDesigner() {
  document.getElementById("promptinput").addEventListener("keyup", onkey, false);
  function onkey(e) {
    //this
    let inputtext = this.value;
    //check if "#TEXT#" is contained in inputtext
    if (inputtext.indexOf("#TEXT#") != -1) {
      toggleHiddenCreateAndPH(true);
    } else {
      toggleHiddenCreateAndPH(false);
    }
  }
}

function selfCheck() {
  let allInputs = document.getElementsByClassName("systeminput");
  // add to allInputs the element with ID systeminput.
  // make allInputs a list
  allInputs = Array.from(allInputs);
  allInputs.push(document.getElementById("systeminput"));
  console.log(allInputs);
  var placeholderPresent = false;
  for (let i = 0; i < allInputs.length; i++) {
    let inputtext = allInputs[i].value;
    console.log(inputtext, inputtext.indexOf("#TEXT#"), inputtext.indexOf("#TEXT#") == -1);
    //check if "#TEXT#" doesn`t contained in inputtext
    if (inputtext.indexOf("#TEXT#") != -1) {
      placeholderPresent = true;
      console.log("placeholderPresent", placeholderPresent);
    }
  }
  toggleHiddenCreateAndPHChatGPT(placeholderPresent);
}

function checkAllInputsPromptDesignerChatGPT() {
  // check among all element if class systeminput
  let allInputs = document.getElementsByClassName("systeminput");
  // make a list
  allInputs = Array.from(allInputs);
  // add to allInputs the element with ID systeminput.
  allInputs.push(document.getElementById("systeminput"));
  // for each element
  for (let i = 0; i < allInputs.length; i++) {
    // add a listener on key up, and check if in anyone of them, #TEXT# is contained
    allInputs[i].addEventListener("keyup", selfCheck, false);
  }
}

//make a function that listen for event keydown on the input
document.addEventListener("DOMContentLoaded", function () {
  checkInputOfPromptDesigner();
  checkAllInputsPromptDesignerChatGPT();
  addListenerToAutoAddToggle();
});

//LISTENERS FOR THE BUTTONS
//Load History of the custom prompts
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("history").addEventListener("click", function () {
    //access local history.html file, and modify the html
    chrome.tabs.create({
      url: chrome.runtime.getURL("history.html"),
      active: true,
    });
  });
});

document.addEventListener(
  "DOMContentLoaded",
  function () {
    document.getElementById("saveKey").addEventListener("click", onclick, false);
    function onclick() {
      //send a message to background.js to check the API key
      chrome.runtime.sendMessage({
        text: "checkAPIKey",
        apiKey: document.getElementById("apikey").value,
      });
    }
  },
  false
);
//add Listenere to deleteKey button
document.addEventListener(
  "DOMContentLoaded",
  function () {
    document.getElementById("deleteKey").addEventListener("click", onclick, false);
    function onclick() {
      //send a message to background.js to delete the API key
      chrome.storage.sync.remove("APIKEY");
      // take the value of the input and erase it
      document.getElementById("apikey").value = "API KEY deleted!";
      setTimeout(function () {
        document.getElementById("apikey").value = "";
      }, 2000);
      // reset the icon to the default one
      chrome.action.setIcon({ path: "icons/icon16.png" });
    }
  },
  false
);

// Attach the click event to the respective elements
document.addEventListener(
  "DOMContentLoaded",
  function () {
    document.getElementById("createPrompt").addEventListener("click", () => {
      savePrompt("GPT");
    });
    document.getElementById("createChatGPTPrompt").addEventListener("click", () => {
      savePrompt("ChatGPT");
    });
    document.getElementById("addPlaceHolder").addEventListener("click", addPH);
    document.getElementById("addChatGPTPlaceHolder").addEventListener("click", addChatGPTPH);
    document.getElementById("showKey").addEventListener("click", toggleSaveKeyButton);
    document.getElementById("linkToAPI").addEventListener("click", openLink);
    document.getElementById("linkToGuide").addEventListener("click", openLink);
    document.getElementById("linkToReddit").addEventListener("click", openLink);
    var advancedSettingsHeader = document.getElementById("advancedSettingsHeader");
    var advancedSettingsBody = document.getElementById("advancedSettingsBody");

    advancedSettingsHeader.addEventListener("click", showHideSettings(advancedSettingsBody));

    //same for promptDesign
    var promptDesignHeader = document.getElementById("promptDesignHeader");
    var promptDesignBody = document.getElementById("promptDesignBody");
    promptDesignHeader.addEventListener("click", showHideSettings(promptDesignBody));

    //same for yourPrompts
    var yourPromptsHeader = document.getElementById("yourPromptsHeader");
    var yourPromptsBody = document.getElementById("yourPromptsBody");
    yourPromptsHeader.addEventListener("click", showHideSettings(yourPromptsBody));
  },
  false
);

function showHideSettings(advancedSettingsBody) {
  return function () {
    advancedSettingsBody.classList.toggle("collapse");
  };
}

function openLink() {
  chrome.tabs.create({ active: true, url: this.href });
}

function userOrAssistant(button,textarea) {
  button.addEventListener("click", function () {
    if (button.textContent.includes("user")) {
      button.textContent = "assistant";
      if (textarea){
      textarea.placeholder = "Type the assistant message here...";
    }
    } else {
      button.textContent = "user";
      if (textarea){
      textarea.placeholder = "Type your message here...";
      }
    }
  });
}
function removeMessage(button, message) {
  button.addEventListener("click", function () {
    message.remove();
    selfCheck();
  });
}

let messageCount = 1;
function addMessageLogic() {
  const messageContainer = document.getElementById("message-container");
  const addMessageButton = document.getElementById("addChatGPTMessage");
  // add listener to the button button[id^='assistantOrUser-'], if clicked, change the text to the other one
  const button = document.querySelector("button[id^='assistantOrUser-']");
  userOrAssistant(button, messageContainer.lastElementChild.querySelector("textarea"));
  const remove = document.querySelector("button[id^='deleteChatGPTMessage-']");
  removeMessage(remove, messageContainer.lastElementChild);

  const setNewMessage = function (e) {
    const messageRow = messageContainer.lastElementChild.cloneNode(true);
    const messageRowId = "message-row-" + ++messageCount;
    const messageTextAreaId = "systeminput-" + messageCount;
    messageRow.setAttribute("id", messageRowId);
    messageRow.querySelector("textarea").setAttribute("id", messageTextAreaId);

    messageRow.querySelector("textarea").value = "";

    // add listener to the input, if keyup, check if #TEXT# is contained
    messageRow.querySelector("textarea").addEventListener("keyup", selfCheck);

    const deleteBtn = messageRow.querySelector("button[id^='deleteChatGPTMessage-']");
    deleteBtn.setAttribute("id", "deleteChatGPTMessage-" + messageCount);
    // remove attribut hidden from remove button
    deleteBtn.removeAttribute("hidden");

    const button = messageRow.querySelector("button[id^='assistantOrUser-']");
    if (button.textContent.includes("user")) {
      button.textContent = "assistant";
      messageRow.querySelector("textarea").placeholder = "Type the assistant message here...";

    } else {
      button.textContent = "user";
      messageRow.querySelector("textarea").placeholder = "Type your message here...";
    }
    button.setAttribute("id", "assistantOrUser-" + messageCount);

    // add listener to the button, if clicked, change the text to the other one
    userOrAssistant(button,messageRow.querySelector("textarea"));
    removeMessage(deleteBtn, messageRow);

    messageContainer.appendChild(messageRow);
  };
  addMessageButton.addEventListener("click", setNewMessage);

  // select the user or assistant
}
// Load the list of custom prompts from the storage
document.addEventListener(
  "DOMContentLoaded",
  function () {
    //retrieve from chrome storage the custom prompt
    getFromStorage("customprompt", true).then((items) => {
      //if it exists send an alert
      if (typeof items.customprompt !== "undefined") {
        makePromptList(items);
      }
    });
    checkAPIKeyatBeginning();

    // add logic for adding messages
    addMessageLogic();
    // add listener to selection on the inputmodel
    document.getElementById("inputmodel").addEventListener("change", function () {
      //if the user select the model text-davinci-003 or text-davinci-002
      console.log(document.getElementById("inputmodel").value);
      const model = document.getElementById("inputmodel").value;
      if (model in CHAT_API_MODELS) {
        chatGPTDesignON();
      } else {
        GPTDesignON();
      }

      //end
    });
  },
  false
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "API_key_valid") {
    saveKey();
    chrome.action.setIcon({ path: "icons/NewiconA16.png" });
    document.getElementById("apikey").value = "The API KEY is valid!";
    document.getElementById("apikey").style.color = "#10a37f"; //green color
    setTimeout(() => {
      hideSaveKey();
      // set the color back to black
      document.getElementById("apikey").style.color = "#495057";
    }, 3000);
    //
  } else if (request.message === "API_key_invalid") {
    document.getElementById("apikey").value = "The API KEY is invalid.";
    document.getElementById("apikey").style.color = "#e74c3c"; //red color
    setTimeout(() => {
      document.getElementById("apikey").value = "";
      document.getElementById("apikey").style.color = "#495057";
    }, 3000);
  }
});

function GPTDesignON() {
  document.getElementById("chatgptinput").setAttribute("hidden", true);
  document.getElementById("completioninput").removeAttribute("hidden");
}

function chatGPTDesignON() {
  document.getElementById("chatgptinput").removeAttribute("hidden");
  document.getElementById("completioninput").setAttribute("hidden", true);
}

// if the API key is present in memory, hide the button to save it
function checkAPIKeyatBeginning() {
  getFromStorage("APIKEY").then((items) => {
    // Check that the API key exists
    if (typeof items.APIKEY !== "undefined") {
      hideSaveKey();
    } else {
      //hide show key button
      document.getElementById("showKey").style.display = "none";
      // hide the linkToGuide
      document.getElementById("linkToGuide").style.display = "none";
    }
  });
}

// Update the values of temperature

// To get the value of the temperature and pass it to element with id temp
function Temp() {
  document.getElementById("temp").value = document.getElementById("temperature").value;
}

// add listener when the input is changed and activate the function Temp()
document.addEventListener(
  "DOMContentLoaded",
  function () {
    document.getElementById("temperature").addEventListener("mousemove", Temp, false);
  },
  false
);


// DRAGGABLE LIST OF PROMPTS in popup.html

var btn = document.querySelector(".add");
var remove = document.querySelector(".draggable");

function dragStart(e) {
  this.style.opacity = "0.4";
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  console.log("Inner html", this.innerHTML);
  e.dataTransfer.setData("text/html", this.innerHTML);
  // can one transfer also the id of the element? Answer: yes
}

function dragEnter(e) {
  this.classList.add("over");
}

function dragLeave(e) {
  e.stopPropagation();
  this.classList.remove("over");
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function dragDrop(e) {
  if (dragSrcEl != this) {
    console.log("dragSrcEl", dragSrcEl);
    dragSrcEl.innerHTML = this.innerHTML;
    const id_source = dragSrcEl.id;
    dragSrcEl.id = this.id;
    this.innerHTML = e.dataTransfer.getData("text/html");
    this.id = id_source;
    // get the button delete of the source and the target
  }
  return false;
}

function dragEnd(e) {
  var listItens = document.querySelectorAll(".draggable");
  [].forEach.call(listItens, function (item) {
    item.classList.remove("over");
  });
  this.style.opacity = "1";
  // save the new order of the list
  //   newOrderFromID();
  reoderListinMemory();
}

function newOrderFromID() {
  var listItens = document.querySelectorAll(".draggable");
  var list = [];
  [].forEach.call(listItens, function (item) {
    list.push(item.id);
  });
  console.log("list", list);
  return list;
}

function reoderListinMemory() {
  // get the list of prompts from memory
  getFromStorage("customprompt", true).then((items) => {
    // Check that the API key exists
    if (typeof items.customprompt !== "undefined") {
      // alert(items.customprompt);
      var list = items.customprompt;
      // get the new order of the list
      var newOrder = newOrderFromID();
      // reoder the list
      var newList = [];
      for (var i = 0; i < newOrder.length; i++) {
        newList.push(list[newOrder[i]]);
      }
      // save the new list in memory, first locally and then in sync
      setInStorage({ customprompt: newList }, true);
      setInStorage({ customprompt: newList });

      items.customprompt = newList;
      makePromptList(items);
    }
    chrome.runtime.sendMessage({ text: "newPromptList" });
  });
}

function addEventsDragAndDrop(el) {
  el.addEventListener("dragstart", dragStart, false);
  el.addEventListener("dragenter", dragEnter, false);
  el.addEventListener("dragover", dragOver, false);
  el.addEventListener("dragleave", dragLeave, false);
  el.addEventListener("drop", dragDrop, false);
  el.addEventListener("dragend", dragEnd, false);
}

