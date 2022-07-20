// function to alert the message, like gpt-3 response. TODO: make it a popup, not an alert
chrome.runtime.onMessage.addListener(function (request) {
    alert(request)
})


// just for testing the message passing
chrome.runtime.onMessage.addListener( (req,snd,rsp) => {
    console.log( snd.tab ? "another content script says:" : "the extension says:" );
    console.log( req );
    rsp( 'a-response-object' );
} );
