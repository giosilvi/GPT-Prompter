import promptGPT3Prompting from './gpt3.js';
import symbolFromModel from './sharedfunctions.js';


// FUNCTIONS DECLARATION
async function checkGPT(apikey) {
    // Get the API key from storage
    chrome.storage.sync.get('APIKEY', async function (items) {
        // Set the URL for the OpenAI models endpoint
        const url = "https://api.openai.com/v1/models";
        // Make a GET request to the endpoint with the provided API key
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apikey
            }
        });
        // If the request was successful, parse the response as JSON
        if (response.ok) {
            // const result = await response.json();
            // Send a message to the runtime indicating that the API_key_valid
            chrome.runtime.sendMessage({ message: 'API_key_valid' });
        } else {
            // If the request was not successful, send a message to the runtime indicating that the API_key_invalid
            chrome.runtime.sendMessage({ message: 'API_key_invalid' });
        }
    });
}




//add a function to check if the API key is present in storage, if not set black icon
function checkAPIKey() {
    chrome.storage.sync.get('APIKEY', function (items) {
        // Check that the API key exists
        if (typeof items.APIKEY == 'undefined') {
            // run your script from here
            chrome.action.setIcon({ path: "icons/icon16.png" })
        }
    }
    );
}

//Function to create context menu, erasing the previous one
function createContextMenu() {
    // Remove existing context menus
    chrome.contextMenus.removeAll();

    // Create new context menu
    chrome.contextMenus.create({
        id: 'GPT-Prompter',
        title: 'GPT-Prompter',
        documentUrlPatterns: ["https://*/*", "http://*/*", "file:///*"],
        contexts: ["all"]
    });

    // Create sub-context menu for prompt on the fly 🤖
    chrome.contextMenus.create({
        id: 'On-the-Fly',
        title: '★ Prompt On-the-Fly ★',
        parentId: 'GPT-Prompter',
        contexts: ["all"]
    });

    // Create a separator
    chrome.contextMenus.create({
        id: 'separator',
        type: 'separator',
        parentId: 'GPT-Prompter',
        contexts: ["all"]
    });

    // Retrieve list of custom prompts from storage
    chrome.storage.sync.get('customprompt', function (items) {
        if (items.customprompt) {
            // Create a context menu for each custom prompt
            items.customprompt.forEach((prompt, index) => {
                const symbol = symbolFromModel(prompt.model);
                chrome.contextMenus.create({
                    id: `customprompt-${index}`,
                    parentId: "GPT-Prompter",
                    title: passTitleOrPrompt(prompt, symbol),
                    contexts: ["all"]
                });
            });
        }
    });
}

function passTitleOrPrompt(customprompt, symbol) {
    // if customprompt contains  a title return the title
    if (customprompt.title) {
        return `${symbol} ${customprompt.title.replaceAll('#TEXT#', '%s')}`;
    }
    else {
        return `${symbol} ${customprompt.prompt.replaceAll('#TEXT#', '%s')}`;
    }
}

// LISTENER DECLARATION

// Initial context menu creation, on install
chrome.runtime.onInstalled.addListener(function (details) {
    // if (details.reason === "install") {
    //     chrome.action.openPopup(); // open popup not a function, but is in documentation
    //   }
    checkAPIKey();
    // add one prompt to the storage
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check if customprompt is a list of strings
            if (items.customprompt.length > 0 && typeof items.customprompt[0] === 'string') {
                console.log("Fixing the prompt list")
                //loop over the list of prompts
                for (var i = 0; i < items.customprompt.length; i++) {
                    // modify each one of them to become a dictionary
                    items.customprompt[i] = {
                        "model": "text-davinci-003",
                        "temperature": 0.1,
                        "max_tokens": 1024,
                        "prompt": items.customprompt[i],
                    }
                }
            }
        }
        else { // if the prompt does not exist, create the default one
            items.customprompt = [{ "model": "text-davinci-003", "temperature": 0.1, "max_tokens": 1024, "prompt": 'Tell me more about #TEXT# :' }];
        }
        // save the new_prompt_list
        chrome.storage.sync.set({ 'customprompt': items.customprompt });
        // create the context menu
        createContextMenu()
    });
    // set advacned setting to true if not set { 'advancedSettings': { "showProb": true} }
    chrome.storage.sync.get('advancedSettings', function (items) {
        // Check that the advancedSettings exists
        if (typeof items.advancedSettings == 'undefined') {
            // set advancedSettings as a dictionary
            items.advancedSettings = {};
        }
        // if showProb is not set, set it to true
        if (typeof items.advancedSettings.showProb == 'undefined') {
            items.advancedSettings.showProb = true;
            items.advancedSettings.autoAdd = false;
        }
        // save 
        chrome.storage.sync.set({ 'advancedSettings': items.advancedSettings });
    });
});


// Listen for a signal to refresh the context menu
chrome.runtime.onMessage.addListener((message, sender) => {
    // If the signal is to refresh the context menu
    if (message.text === 'new_prompt_list') {
        createContextMenu();
    }
    // If the signal is to check the API key
    else if (message.text === 'checkAPIKey') {
        (async () => {
            await checkGPT(message.apiKey);
        })();
    }
    // If the signal is to launch GPT
    else if (message.text === 'launchGPT') {
        // Get the tab from the sender
        const { tab } = sender; // this line is equivalent to const tab = sender.tab;
        // Launch GPT
        chrome.storage.sync.get('APIKEY', function (items) {
            (async () => {
                await promptGPT3Prompting(message.prompt, items, tab);
            })();
        });
    }
    else {
        console.log('Unknown message: ', message);
    }
});

// The following code will first disable the context menu item with ID "GPT-Prompter" when the active tab is changed or reloaded.
// Then it will check if the new tab is complete, if it is, it will send a message to the content script of the new tab 
// with the message "shouldReenableContextMenu" and a callback function that will handle the response from the content script.

let contextMenuEnabled = false;
function updateContextMenu(tab, contextMenuEnabled) {
    chrome.contextMenus.update("GPT-Prompter", { enabled: false });
    // console.log('Check if content script is running...');
    contextMenuEnabled = false;
    // if the tab is complete, send a message to the content script to check if the context menu should be re-enabled
    chrome.tabs.sendMessage(tab.id, { greeting: "shouldReenableContextMenu" }, function (response) {
        if (response && response.farewell === 'yes') {
            chrome.contextMenus.update("GPT-Prompter", { enabled: true });
            contextMenuEnabled = true;
        }
        else if (chrome.runtime.lastError) {
            contextMenuEnabled = false;
        }
        else {
            console.log('Error.')
        }
    });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].status === 'complete') {
            updateContextMenu(tabs[0], contextMenuEnabled);
        }
    });
});
// on Updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        updateContextMenu(tab, contextMenuEnabled);
    }
});





function launchPromptOnTheFly(selectionText, prompt) {

    if (typeof selectionText == 'undefined') {
        selectionText = '';
    }
    // if there is a text /#TEXT#/g inside selectionText replace with nothing, and use the position to set the cursor later
    var cursorPosition = selectionText.search(/#TEXT#/g);
    if (cursorPosition !== -1) {
        selectionText = selectionText.replace(/#TEXT#/g, '');
    }
    // if prompt is not null, use it
    if (prompt !== null) {
        var model = prompt["model"]
        var temperature = prompt["temperature"]
        var max_tokens = prompt["max_tokens"]
        // make the bodyData
        var bodyData = { "model": model, "temperature": temperature, "max_tokens": max_tokens };
    }
    else {
        // if prompt is null, use the default one
        var bodyData = { "model": "text-davinci-003", "temperature": 0.1, "max_tokens": 1024 };
    }
    // here we want to create a minipop-up to ask the user to insert the prompt
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'showPopUpOnTheFly', text: selectionText, bodyData: bodyData, cursorPosition: cursorPosition });
    });
}


// Shortcut to launch the prompt on the fly
chrome.commands.onCommand.addListener(function (command) {
    // if command is prompt-on-the-fly, and the context menu is enabled, launch the prompt on the fly    
    if (command === "prompt-on-the-fly" && contextMenuEnabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            // Get the current tab
            var tab = tabs[0];
            // Send a message to the content script to get the selected text
            chrome.tabs.sendMessage(tab.id, { getSelection: true }, function (response) {
                // Call the launchPromptOnTheFly function with the selected text and the current tab
                launchPromptOnTheFly(response.selection, null);
            });
        });
    }
    else {
        //send a message to the content script to show a notification
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            //catch the error if the content script is not running
            chrome.tabs.sendMessage(tabs[0].id, 'GPT-Prompter: Content script not yet running. Wait for the page to load.', function (response) {
                if (chrome.runtime.lastError) {
                    console.log('Content script not available');
                }
            });
        });
    }

});



// Listen for clicks on context menu items
chrome.contextMenus.onClicked.addListener(async (info, tabs) => {
    // Check if the API key is present in storage
    const { APIKEY } = await new Promise((resolve) => {
        chrome.storage.sync.get('APIKEY', resolve);
    });
    // If the API key is not found, send a message to the tab and return early
    if (typeof APIKEY === 'undefined') {
        chrome.tabs.sendMessage(tabs.id, 'GPT-Prompter: \n API KEY not found. Click on the extension icon to set it. \n (Top right corner of the browser -> puzzle piece icon -> GPT-Prompter)');
        return;
    }

    // If the clicked context menu item is a custom prompt
    if (info.menuItemId.startsWith('customprompt-')) {
        // Extract the prompt number from the menu item's ID
        const promptNumber = parseInt(info.menuItemId.replace('customprompt-', ''), 10);
        // Retrieve the list of custom prompts from storage
        chrome.storage.sync.get('customprompt', (items) => {
            // Check that the list of custom prompts exists
            if (Array.isArray(items.customprompt)) {
                // Check that the prompt number is valid
                if (promptNumber <= items.customprompt.length) {
                    // Get the prompt object
                    const prompt = items.customprompt[promptNumber];
                    // Update the prompt text with the selected text, if there is any
                    if (info.selectionText) {
                        prompt.prompt = prompt.prompt.replace(/#TEXT#/g, info.selectionText);
                        // Send a message to the content script to show the popup
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            chrome.tabs.sendMessage(tabs[0].id, { message: 'showPopUp' });
                        });
                        // Get the APIKEY from storage
                        chrome.storage.sync.get('APIKEY', function (items) {
                            // Launch the prompt
                            (async () => {
                                await promptGPT3Prompting(prompt, items, tabs);
                            })();
                        });
                    }
                    else {
                        // launch prompt on the fly with the prompt object
                        // but first substitute the #TEXT# placeholder with nothing
                        // prompt.prompt = prompt.prompt.replace(/#TEXT#/g, '');
                        launchPromptOnTheFly(prompt.prompt, prompt);
                    }
                } else {
                    // If the prompt number is invalid, send an error message to the tab and log a message to the console
                    chrome.tabs.sendMessage(tabs.id, 'Error: invalid prompt number');
                    console.log('Error: invalid prompt number');
                }
            } else {
                // If the list of custom prompts does not exist, send an error message to the tab and log a message to the console
                chrome.tabs.sendMessage(tabs.id, 'Error: no prompt list found');
                console.log('Error: no custom prompts');
            }
        });
    }
    // If the clicked context menu item is the "On-the-Fly" prompt
    else if (info.menuItemId === 'On-the-Fly') {
        // Launch the "On-the-Fly" prompt with the selected text and the current tabs object
        launchPromptOnTheFly(info.selectionText, null);
    }
});

// create Context Menu every time browser starts
chrome.runtime.onStartup.addListener(function () {
    createContextMenu();
}
);



