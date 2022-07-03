chrome.runtime.onMessage.addListener(function (request) {
    alert(request)
})
// Explanation of the function above:
// The function chrome.runtime.onMessage.addListener() is used to listen for messages from the background script.
// The function alert() is used to show the message in the popup.

/*
 * fg.js -- a content script for a minimal ManifestV3 test extension.
 */

console.log( "Activating content script...try context menu!" );

chrome.runtime.onMessage.addListener( (req,snd,rsp) => {
    console.log( snd.tab ? "another content script says:" : "the extension says:" );
    console.log( req );
    rsp( 'a-response-object' );
} );

// Explanation of the function above:
// The function chrome.runtime.onMessage.addListener() is used to listen for messages from the background script.
// addListener() takes two arguments:
// - the event name, which is "onMessage" in this case
// - the function to be called when the event is triggered, in this case:
// the function is called when the extension receives a message from the background script.
// The function takes three arguments:
// - req, which is an object that contains information about the event.
// - snd, which is an object that contains information about the sender.
// - rsp, which is a function that is called to respond to the event.

// the snippet snd.tab ? "another content script says:" : "the extension says:"
// is used to determine whether the message is from another content script or the extension.
// If the message is from another content script, the snippet "another content script says:" is used.
// If the message is from the extension, the snippet "the extension says:" is used.
// Another content script can be a content script of a different extension. 

// The function console.log() is used to show the message in the popup.
// The function rsp() is used to send a response to the background script.