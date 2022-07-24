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




const mediumHighlighter = document.createElement("medium-highlighter");
window.addEventListener("scroll", function () {
  var x = window.scrollX, y = window.scrollY;
  // get the scroll position of the page
  // console.log(x, y);
  // set the position of the marker
  // console.log(x+" "+y);
  // for loop from 0 to mediumHighlighter.ids
  for (var i = 0; i < mediumHighlighter.ids; i++) {
    //
    elem = mediumHighlighter.shadowRoot.getElementById(i);
    // console.log(elem.offsetTop)
    // get position of elem in px
    var elemTop = elem.offsetTop - (y - this.window.lastY);
    var elemLeft = elem.offsetLeft - (x - this.window.lastX);

    elem.style.top = elemTop + 'px';
    elem.style.left = elemLeft + 'px';

  }
  this.window.lastY = y;
  this.window.lastX = x;
}
);


document.body.appendChild(mediumHighlighter);

const setMarkerPosition = (markerPosition) =>
  mediumHighlighter.setAttribute(
    "markerPosition",
    JSON.stringify(markerPosition)
  );

const getSelectedText = () => window.getSelection().toString();

document.addEventListener("click", () => {
  if (getSelectedText().length > 0) {
    setMarkerPosition(getMarkerPosition());
  }
});

// document.addEventListener("selectionchange", () => {
//   if (getSelectedText().length === 0) {
//     setMarkerPosition({ display: "none" });
//   }
// });

function getMarkerPosition() {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  return {
    // Substract width of marker button -> 40px / 2 = 20
    left: rangeBounds.right + 5,
    top: rangeBounds.top,
    display: "none",
  };
}


// function to alert the message, like gpt-3 response. TODO: make it a popup, not an alert
chrome.runtime.onMessage.addListener(function (request) {
  //  if attribute text in request exists, it's a gpt-3 response
  if (request.message == 'highlight') {
    setMarkerPosition({ display: "flex" });
    mediumHighlighter.highlightSelection();
  }
  else if (request.message == 'GPTanswer') {
    mediumHighlighter.updatepopup(request.text);
  }
  else {
    alert(request)
  }
})


// just for testing the message passing
chrome.runtime.onMessage.addListener((req, snd, rsp) => {
  console.log(snd.tab ? "another content script says:" : "the extension says:");
  console.log(req);
  rsp('a-response-object');
});
