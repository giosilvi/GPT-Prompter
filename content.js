// function notifyMe() {
//     if (Notification.permission !== 'granted')
//      Notification.requestPermission();
//     else {
//      var notification = new Notification('Notification title', {
//       icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
//       body: 'Hey there! You\'ve been notified!',
//      });
//      notification.onclick = function() {
//       window.open('http://stackoverflow.com/a/13328397/1269037');
//      };
//     }
// }


// function to alert the message, like gpt-3 response. TODO: make it a popup, not an alert
chrome.runtime.onMessage.addListener(function (request) {
    alert(request)
    // notifyMe()
})


// just for testing the message passing
chrome.runtime.onMessage.addListener( (req,snd,rsp) => {
    console.log( snd.tab ? "another content script says:" : "the extension says:" );
    console.log( req );
    rsp( 'a-response-object' );
} );
