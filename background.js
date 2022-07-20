/*
 * bg.js -- a ManifestV3 service_worker that installs a context menu
 *          plus minimal framework for messaging between here and
 *          a content script.
 */
import promptGPT3Explanation from './gpt3.js';


//Function to create context menu, erasing the previous one
function createContextMenu() {
    // if the context menu already exists, erase it
    chrome.contextMenus.removeAll();
    // create a new context menu
    chrome.contextMenus.create({
        id: 'GPT-xplainer',
        title: 'GPT-xplainer ',
        contexts: ["selection"]
    });
    // retrieve from storage the list of custom prompts
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // add a context menu for each custom prompt
            for (var i = 0; i < items.customprompt.length; i++) {
                chrome.contextMenus.create({
                    id: 'customprompt-' + i,
                    parentId: "GPT-xplainer",
                    title: items.customprompt[i].replace('##SELECTED TEXT##', '%s'),
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
        items.customprompt = ['Tell me more about "##SELECTED TEXT##":'];
        // save the new prompt
        chrome.storage.sync.set({ 'customprompt': items.customprompt });
        createContextMenu()
    }
    );
    
});

// listen for a signal to refresh the context menu
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.text == "new prompt list") {
        createContextMenu()
        // Run your script from here
    }
});



chrome.contextMenus.onClicked.addListener((info, tabs) => {
    console.log('context menu clicked');
    console.log(info.selectionText);
    console.log(tabs);
    // get the id of the context menu clicked
    console.log(info.menuItemId.replace('customprompt-', ''));
    // to transfort a string to int do: parseInt(string)
    var promptNumber = parseInt(info.menuItemId.replace('customprompt-', ''));
    console.log(promptNumber);
    // retrieve from storage the list of custom prompts
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check tha the prompt number is valid
            if (promptNumber <= items.customprompt.length) {
                // get the prompt
                var prompt = items.customprompt[promptNumber];
                // replace the selected text in the prompt
                prompt = prompt.replace('##SELECTED TEXT##', info.selectionText);
                // console.log(prompt);

                (async () => {
                    await promptGPT3Explanation(prompt, tabs)
                }
                )();
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

//add a function to check if the API key is present in storage
function checkAPIKey() {
    chrome.storage.sync.get('APIKEY', function (items) {
        // Check that the API key exists
        if (typeof items.APIKEY !== 'undefined') {
            // run your script from here
            chrome.action.setIcon({ path: "icons/iconA16.png" })
        }
    }
    );
}
checkAPIKey();