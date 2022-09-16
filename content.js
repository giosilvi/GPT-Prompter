

window.addEventListener("scroll", function () {
  var x = window.scrollX, y = window.scrollY;
  for (var i = 1; i <= customMiniPopup.ids; i++) {
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
    left: rangeBounds.right + 5,
    top: rangeBounds.top,
    display: "none",
  };
}



// function to alert the message, like gpt-3 response. TODO: make it a popup, not an alert
chrome.runtime.onMessage.addListener(function (request) {
  //  if attribute message in request exists, it's a gpt-3 response
  if (request.id_popup == undefined) {
    var id_popup = -1;
  }
  else {
    var id_popup = parseInt(request.id_popup);
  }

  if (request.message == 'showPopUp') {
    customMiniPopup.ids++; // increment the number of popups, and id of the new popup
    // console.log('ID:',customMiniPopup.ids);
    if (customMiniPopup.hasAttribute("markerPosition") && customMiniPopup.usecornerPopUp == false) {
      customMiniPopup.defaultpopup(); // show the popup
    }
    else { // in case we can`t get the markerPosition, we use the corner popup, at position 0,0
      // set to True, so every time we show the popup, it will be at 0,0 (for this page)
      customMiniPopup.cornerpopup();
    }
    addListenersForDrag();
  }
  else if (request.message == 'showPopUpOnTheFly') {
    customMiniPopup.ids++;
    customMiniPopup.ontheflypopup(request.text)
    addListenersForDrag();
  }
  else if (request.message == 'GPTStream_answer') {
    // split over 'data: ' in case there are multiple streams concatenated
    var data = request.text.split('data: ');
    
      // console.log('split:' + data.length);
    for (var m = 1; m < data.length; m++) {// in case of multiple stream in one, loop over them
      // console.log('data len: ',data.length);
      if (data[m].indexOf("[DONE]") == -1) { // if there is not "[DONE]" in the text, it`s a stream
          // console.log('data:', data[m]);
          var json = JSON.parse(data[m]);
          customMiniPopup.updatepopup(json, id_popup, true);
        }
        else {
          customMiniPopup.updatepopup(request, id_popup, false); // the end of the stream
        }
      }
      // in case of error, the split will not produce more than one element
      if (data.length == 1) {
        //convert request.text to JSON
        var json = JSON.parse(request.text);
        if (json.error) {
          customMiniPopup.updatepopup(json, id_popup, true);
          // addListenersForDrag();
        }
      }
    }
  else if (request.message == 'GPTprompt') {
      // for updating the prompt upper part of the popup
      // if request.id_popup is undefined, set it to -1

      customMiniPopup.updatepopup_onlypromt(request, id_popup);
      // addListenersForDrag();

    }
    else {
      alert(request)
    }
  })




function addListenersForDrag() {
  // add a listener to the mouse down event, to call the mouseDown function, to each popup in the shadowDOM
  for (var indice = 1; indice <= customMiniPopup.ids; indice++) {
    elem = customMiniPopup.shadowRoot.getElementById(indice + "prompt").addEventListener('mousedown', mouseDown, false);
  }
}

function mouseDown(e) {
  // this is to avoid the selection of the child text, when the target is the parent
  // if (e.target.id == this.id+'text')
  //   return;
  e.preventDefault(); // prevent the selection of the text below the popup
  const id_target = this.id.replace('prompt', '');
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
  var prompt_object = customMiniPopup.shadowRoot.getElementById(id + 'prompt')

  var mouse_y = e.clientY;
  var mouse_x = e.clientX;
  var mouse_x_position = mouse_x - object.offsetWidth / 2;
  var mouse_y_position = mouse_y - prompt_object.offsetHeight / 1.5;

  // console.log(x_position,e.clientX) // x position of the mouse pointer
  // console.log(y_position,e.clientY) // y position of the mouse pointer
  object.style.top = mouse_y_position + 'px';
  object.style.left = mouse_x_position + 'px';
}

console.log('GPT-prompter content script is running')