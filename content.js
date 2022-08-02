

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
  }
  else if (request.message == 'GPTanswer') {
    customMiniPopup.updatepopup(request.text);
  }
  else if (request.message == 'GPTStream_answer'){
    //convert request.text to JSON
    var text = request.text.substring(6); // remove the first "data: "
    //if text is not "[DONE]"
    console.log(text,text.indexOf("[DONE]")==-1);
    // if last characht of text is not "]"
    if (text.indexOf("[DONE]")==-1) {
    var json = JSON.parse(text);
    var text = json.choices[0].text
    customMiniPopup.updatepopup(text, true);
    }
    else {
      customMiniPopup.updatepopup("[DONE]", false);
    }
  }
  else {
    alert(request)
  }
})


// Obsolete, useful for debugging
// chrome.runtime.onMessage.addListener((req, snd, rsp) => {
//   console.log(snd.tab ? "another content script says:" : "the extension says:");
//   console.log(req);
//   rsp('a-response-object');
// });
