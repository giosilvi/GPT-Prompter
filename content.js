

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
      //  customMiniPopup.highlightSelection(); // highlight the selection
    }
    else { // in case we can`t get the markerPosition, we use the default popup, at position 0,0
      customMiniPopup.defaultpopup();
    }
  }
  else if (request.message == 'GPTStream_answer') {
    // split over 'data: ' in case there are multiple streams concatenated
    var data = request.text.split('data: ');
    // console.log('split:' + data.length);
    for (var m = 1; m < data.length; m++) {// in case of multiple stream in one, loop over them

      if (data[m].indexOf("[DONE]") == -1) { // if there is not "[DONE]" in the text, it`s a stream
        // console.log('data:', data[m]);
        var json = JSON.parse(data[m]);
        customMiniPopup.updatepopup(json, true);
        if (json.error) { addListenersForDrag(); } // just in case of error in a bundle of streams, not sure it`s needed
      }
      else {
        customMiniPopup.updatepopup(request, false); // the end of the stream
        addListenersForDrag();
      }
    }
    // in case of error, the split will not produce more than one element
    if (data.length == 1) {
      //convert request.text to JSON
      var json = JSON.parse(request.text);
      if (json.error) {
        customMiniPopup.updatepopup(json, true);
        addListenersForDrag();
      }
    }
  }
  else if (request.message == 'GPTprompt') {
    // for updating the prompt upper part of the popup
    customMiniPopup.updatepopup_onlypromt(request);

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


// code to move the mini popup

function addListenersForDrag() {
  // add a listener to the mouse down event, to call the mouseDown function, to each popup in the shadowDOM
  for (var indice = 0; indice < customMiniPopup.ids; indice++) {
    elem = customMiniPopup.shadowRoot.getElementById(indice).addEventListener('mousedown', mouseDown, false);
  }
}

function mouseDown(e) {
  // this is to avoid the selection of a child, when the target is the parent
  if (e.target !== this)
    return;
  e.preventDefault();
  const id_target = this.id;
  function wrapper(event) {
    spanMove(event, id_target)
  }
  window.addEventListener('mousemove', wrapper, true);
  // add a listener to the mouse up event, to remove the wrapper function when the mouse is up
  window.addEventListener('mouseup', function () {
    window.removeEventListener('mousemove', wrapper, true);
  }
    , false);
}



function spanMove(e, id) {
  var object = customMiniPopup.shadowRoot.getElementById(id)

  // variables 
  var y_position = object.offsetTop;
  var x_position = object.offsetLeft;
  var mouse_y = e.clientY;
  var mouse_x = e.clientX;
  var mouse_x_position = mouse_x - object.offsetWidth / 2;
  var mouse_y_position = mouse_y - object.offsetHeight / 4;

  // console.log(x_position,e.clientX) // x position of the mouse pointer
  // console.log(y_position,e.clientY) // y position of the mouse pointer

  // for loop over distance between mouse position and object position
  if (mouse_y_position > y_position) {
    object.style.top = mouse_y_position + 'px';

  }
  else {
    object.style.top = mouse_y_position + 'px';

  }
  if (mouse_x_position > x_position) {
    object.style.left = mouse_x_position + 'px';
  }
  else {
    object.style.left = mouse_x_position + 'px';
  }
  // object.previous_x_position = x_position;
  // object.previous_y_position = y_position;
}
