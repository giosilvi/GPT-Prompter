/*
 * bg.js -- a ManifestV3 service_worker that installs a context menu
 *          plus minimal framework for messaging between here and
 *          a content script.
 */
import promptGPT3Explanation from './gpt3.js';


// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//      console.log(request.APIKEY);
//     }
//   );

// function sendSearch(selectedText) {
//     var serviceCall = 'http://www.google.com/search?q=' + selectedText;
//     chrome.tabs.create({url: serviceCall});
//     }

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'GPT-xplainer',
        title: 'GPT-3 Tell me more about "%s"',
        contexts: ["selection"]
        // onclick: function(info, tab) {
        //     promptGPT3Explanation(info.selectionText,tab.id);
        // }
    });
});

chrome.contextMenus.onClicked.addListener((info, tabs) => {
    console.log('context menu clicked');
    console.log(info.selectionText);
    console.log(tabs);
    // call promptGPT3Explanation() to show the GPT3 explanation
    (async () => {
        await promptGPT3Explanation(info.selectionText,tabs.id)
     

    // console.log(response);
    // chrome.tabs.sendMessage(tabs.id, response,
    //     (rsp) => {
    //         console.log("content script replies:");
    //         console.log(rsp);
    //     });
    })()
    //Here we can use the selected text to be send in a prompt to GPT3

});


// the function sendMessage() accepts three arguments:
// - the tab id
// - the message
// - the callback function, a callback function is a function that is called
// when the asynchronous operation is complete.
// The tabs.id contains the id of the tab that is currently active.

// the function addListener() takes two arguments:
// - the event name
// - the function to be called when the event is triggered
// if addListener() is called from onClicked(),
//the function is called when the user clicks on the context menu.
// In this case, addListener() takes two arguments:
// - the event name which is "onClicked"
// - the function to be called when the event is triggered, in the case above:
// the function is called when the user clicks on the context menu.
// The function takes two arguments:
// - info, which is an object that contains information about the event.
// - tabs, which is an array of objects that contains information about the tabs.
// info comes from the context menu, tabs comes from the tabs.
// We are interested in the selectionText property of the info object.
// The selectionText property is the text that the user has selected.
// We want to send this text to the content script. So we use the sendMessage() function.
// The content script is the script that is injected into the page.

//Between content and background scripts, in case one need to make some computation,
// one should place the computation in the background script. This is because the
// computation is done in the background script, and the result is sent to the content script.