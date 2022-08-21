/*
 * bg.js -- a ManifestV3 service_worker that installs a context menu
 *          plus minimal framework for messaging between here and
 *          a content script.
 */
import promptGPT3Prompting from './gpt3.js';

function symbolFromModel(model)
{
    var symbol = '';
    if (model == "text-davinci-002")
        symbol = '🅳';
    else if (model == "text-curie-001")
        symbol = '🅲';
    else if (model == "text-babbage-001")
        symbol = '🅑';
    else if (model == "text-ada-001")
        symbol = '🅐';
    return symbol
}
//Function to create context menu, erasing the previous one
function createContextMenu() {
    // if the context menu already exists, erase it
    chrome.contextMenus.removeAll();
    // create a new context menu
    chrome.contextMenus.create({
        id: 'GPT-Prompter',
        title: 'GPT-Prompter ',
        contexts: ["selection"],
        documentUrlPatterns: ["https://*/*", "http://*/*"]
    });
    // retrieve from storage the list of custom prompts
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // get the model from customprompt["model"]
            
            // add a context menu for each custom prompt
            for (var i = 0; i < items.customprompt.length; i++) {
                var symbol = symbolFromModel(items.customprompt[i]["model"]);
                chrome.contextMenus.create({
                    id: 'customprompt-' + i,
                    parentId: "GPT-Prompter",
                    title: symbol+' '+items.customprompt[i]["prompt"].replaceAll('#TEXT#', '%s'), // here the text in the menu is created with selected text %s
                    contexts: ["selection"]
                });
            }
        }
    });
}


// Initial context menu creation, on install
chrome.runtime.onInstalled.addListener(function () {
    // add one prompt to the storage
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check if customprompt is a list of strings
            if (items.customprompt.length > 0 && typeof items.customprompt[0] === 'string') {
                //loop over the list of prompts
                for (var i = 0; i < items.customprompt.length; i++) {
                    // modify each one of them to become a dictionary
                    items.customprompt[i] = {
                        "model": "text-davinci-002",
                        "temperature": 0,
                        "max_tokens": 1024,
                        "prompt": items.customprompt[i],
                    }
                }
            }
        }
        else {
            items.customprompt = [{ "model": "text-davinci-002", "temperature": 0, "max_tokens": 1024, "prompt": 'Tell me more about "#TEXT#":' }];
            // save the new prompt
        }
        chrome.storage.sync.set({ 'customprompt': items.customprompt });
        createContextMenu()
    });
});

// listen for a signal to refresh the context menu
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.text == "new prompt list") {
        createContextMenu()
    }
    else if (message.text == "checkAPIKey") {
        (async () => {
            await checkGPT(message.apiKey);
        }
        )();
    }
    else { console.log(message); }
});



chrome.contextMenus.onClicked.addListener((info, tabs) => {
    console.log('context menu clicked');
    console.log(info.selectionText);
    console.log(tabs);

    // get the id of the context menu clicked
    // to transfort a string to int do: parseInt(string)
    var promptNumber = parseInt(info.menuItemId.replace('customprompt-', ''));
    // retrieve from storage the list of custom prompts
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check tha the prompt number is valid
            if (promptNumber <= items.customprompt.length) {
                // get the prompt
                var prompt = items.customprompt[promptNumber]
                // get element "prompt" from prompt object
                var promptText = prompt["prompt"];
                promptText = promptText.replaceAll('#TEXT#', info.selectionText);
                // update prompt text in prompt
                prompt["prompt"] = promptText;

                // replace the selected text in the prompt
                chrome.storage.sync.get('APIKEY', function (items) {
                    if (typeof items.APIKEY !== 'undefined') {
                        (async () => {
                            await promptGPT3Prompting(prompt, items, tabs)
                        })();
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, { message: 'highlight' });
                        });
                    }
                    else {
                        chrome.tabs.sendMessage(tabs.id, 'APIKEY not found');
                        console.log('No API key found.');
                    }
                })

            }
            else {
                console.log('invalid prompt number');
            }
        }
        else {
            console.log('no custom prompts');
        }
    });
}
);



async function checkGPT(apikey) {
    chrome.storage.sync.get('APIKEY', function (items) {
        console.log(apikey);
        var url = "https://api.openai.com/v1/models";
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apikey
            },
        }
        ).then(result => result.json())
            .then((result) => {
                console.log(result);
                // if result has data, then the API key is valid
                if (result.data) { chrome.runtime.sendMessage({ message: 'API key is valid' }); }
                else {
                    console.log('Here')
                    chrome.runtime.sendMessage({ message: 'API key is invalid' });
                }

            }).catch(err => {
                console.log("error" + err);
            });

    })
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
checkAPIKey();
