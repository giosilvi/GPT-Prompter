

window.addEventListener("scroll", function () {
  var x = window.scrollX, y = window.scrollY;
  for (var i = 0; i < customMiniPopup.ids; i++) {
    //
    elem = customMiniPopup.shadowRoot.getElementById(i);
    var elemTop = elem.offsetTop - (y - this.window.lastY);
    var elemLeft = elem.offsetLeft - (x - this.window.lastX);

    elem.style.top = elemTop + 'px';
    elem.style.left = elemLeft + 'px';
  }
  this.window.lastY = y;
  this.window.lastX = x;
  // console.log(this.window.lastY);
}
);

const customMiniPopup = document.createElement("mini-popup");
document.body.appendChild(customMiniPopup); //attach the shadowDOM to body

const setMarkerPosition = (markerPosition) =>
  customMiniPopup.setAttribute(
    "markerPosition",
    JSON.stringify(markerPosition)
  );

const getSelectedText = () => window.getSelection().toString();

document.addEventListener("click", () => {
  // console.log(getSelectedText().length)
  if (getSelectedText().length > 0) {
    setMarkerPosition(getMarkerPosition());
  }
});


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
    if (customMiniPopup.hasAttribute("markerPosition")) {
    setMarkerPosition({ display: "flex" });
    customMiniPopup.highlightSelection();}
    else
    { // in case we can`t get the markerPosition, we use the default popup
    customMiniPopup.defaultpopup();
    }
  }
  // else if (request.message == 'GPTanswer') {
  //   customMiniPopup.updatepopup(request.text);
  // }
  else if (request.message == 'GPTStream_answer'){
    //convert request.text to JSON
    console.log(request.text);
    var text = request.text; // remove the first "data: "
    //if text is not "[DONE]"
    // console.log(text);
    if (text.indexOf("[DONE]")==-1) {
      var json = JSON.parse(text);
      customMiniPopup.updatepopup(json, true);
      }
    else {
      // close the stream with the full request data
      customMiniPopup.updatepopup(request, false);
    }
  }
  else {
    alert(request)
  }
})

console.log('GPT-prompter content script is running')

// Obsolete, useful for debugging
// chrome.runtime.onMessage.addListener((req, snd, rsp) => {
//   console.log(snd.tab ? "another content script says:" : "the extension says:");
//   console.log(req);
//   rsp('a-response-object');
// });
