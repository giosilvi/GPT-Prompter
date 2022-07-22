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

// function makeEditableAndHighlight(colour) {
//     var range, sel = window.getSelection();
//     if (sel.rangeCount && sel.getRangeAt) {
//         range = sel.getRangeAt(0);
//     }
//     document.designMode = "on";
//     if (range) {
//         sel.removeAllRanges();
//         sel.addRange(range);
//     }
//     // Use HiliteColor since some browsers apply BackColor to the whole block
//     if (!document.execCommand("HiliteColor", false, colour)) {
//         document.execCommand("BackColor", false, colour);
//     }
//     document.designMode = "off";
// }



const mediumHighlighter = document.createElement("medium-highlighter");
document.body.appendChild(mediumHighlighter);

const setMarkerPosition = (markerPosition) =>
  mediumHighlighter.setAttribute(
    "markerPosition",
    JSON.stringify(markerPosition)
  );

const getSelectedText = () => window.getSelection().toString();

// document.addEventListener("click", () => {
//   if (getSelectedText().length > 0) {
//     setMarkerPosition(getMarkerPosition());
//   }
// });

document.addEventListener("selectionchange", () => {
  if (getSelectedText().length === 0) {
    setMarkerPosition({ display: "none" });
  }
});

function getMarkerPosition() {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  return {
    // Substract width of marker button -> 40px / 2 = 20
    left: rangeBounds.left + rangeBounds.width / 2 - 20,
    top: rangeBounds.top - 30,
    display: "flex",
  };
}


// function to alert the message, like gpt-3 response. TODO: make it a popup, not an alert
chrome.runtime.onMessage.addListener(function (request) {
    //  if attribute text in request exists, it's a gpt-3 response
    if (request == 'highlight') {
        // create a notification
        //alert(request.text);
        // alert(window.getSelection().toString());
        mediumHighlighter.highlightSelection();
    }
    else {
        alert(request)
    }
    // notifyMe()
})


// just for testing the message passing
chrome.runtime.onMessage.addListener((req, snd, rsp) => {
    console.log(snd.tab ? "another content script says:" : "the extension says:");
    console.log(req);
    rsp('a-response-object');
});
