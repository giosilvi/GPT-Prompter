
//LISTENERS
// Listen to scroll event
window.addEventListener("scroll", function () {
  var x = window.scrollX, y = window.scrollY;
  for (var i = 0; i < popUpShadow.listOfUnpinnedPopups.length; i++) {
    var id = popUpShadow.listOfUnpinnedPopups[i];
    elem = popUpShadow.shadowRoot.getElementById(parseInt(id));
    var elemTop = elem.offsetTop - (y - this.window.lastY);
    var elemLeft = elem.offsetLeft - (x - this.window.lastX);

    elem.style.top = elemTop + 'px';
    elem.style.left = elemLeft + 'px';
  }
  this.window.lastY = y;
  this.window.lastX = x;
  });


const getSelectedText = () => window.getSelection().toString();

document.addEventListener("contextmenu", () => {
    // console.log(getSelectedText().length)
    if (getSelectedText().length > 0) {
      setmousePosition("mousePosition_primary", getMarkerPosition());
    }
  });
  
document.addEventListener('contextmenu', function (e) {
    var mousePos = getMousePosition(e);
    setmousePosition("mousePosition_support", {
      left: mousePos.x,
      top: mousePos.y,
    });
  });

function addListenersForDrag() {
    // add a listener to the mouse down event, to call the mouseDown function, to each popup in the shadowDOM
    for (var i = 0; i < popUpShadow.listOfActivePopups.length; i++) {
      //
      var id = popUpShadow.listOfActivePopups[i];
      elem = popUpShadow.shadowRoot.getElementById(id + "header").addEventListener('mousedown', mouseDown, false);
    }
  }
  
function spanMove(e, id_target) {
    var simpleid = id_target.replace('header', '')
    var fullpopup = popUpShadow.shadowRoot.getElementById(simpleid)
    var header = popUpShadow.shadowRoot.getElementById(id_target)
  
    var mouse_y_position = e.clientY - header.offsetHeight / 2 - 20; //20 is the radius of the border I think
    var mouse_x_position = e.clientX - fullpopup.offsetWidth / 2;
  
    fullpopup.style.top = mouse_y_position + 'px';
    fullpopup.style.left = mouse_x_position + 'px';
  }
  
function mouseDown(e) {
    // this is to avoid the selection of the child text, when the target is the parent
    // if (e.target.id == this.id+'text')
    //   return;
    e.preventDefault(); // prevent the selection of the text below the popup
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


// POPUP FUNCTIONS
const popUpShadow = document.createElement("mini-popup");
document.body.appendChild(popUpShadow); //attach the shadowDOM to body


// MOUSE POSITION FUNCTIONS
function getMousePosition(e) {
  var posx = 0;
  var posy = 0;
  if (!e) var e = window.event;
  if (e.clientX || e.clientY) {
    posx = e.clientX
    posy = e.clientY
  }
  return {
    x: posx,
    y: posy
  }
}
const setmousePosition = (name_attribute, mousePosition) =>
  popUpShadow.setAttribute(
    name_attribute,
    JSON.stringify(mousePosition)
  );



function getMarkerPosition() {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  return {
    left: rangeBounds.right + 5,
    top: rangeBounds.top,
  };
}


// function that set mousePosition to the popup
function setmousePositionToPopup() {
  if (popUpShadow.hasAttribute("mousePosition_primary")) {
    popUpShadow.setAttribute("mousePosition", popUpShadow.getAttribute("mousePosition_primary"));
    //remove the attribute mousePosition_primary
    popUpShadow.removeAttribute("mousePosition_primary");
  }
  else if (popUpShadow.hasAttribute("mousePosition_support")) {
    popUpShadow.setAttribute("mousePosition", popUpShadow.getAttribute("mousePosition_support"));
    //remove the attribute mousePosition_support
    popUpShadow.removeAttribute("mousePosition_support");
  }
  else { popUpShadow.setAttribute("mousePosition", JSON.stringify({ left: 0, top: 0 })) }
}


function checkIdPopup(id) {
  if (id == undefined || id == -1) {
    return popUpShadow.ids
  }
  else {
    return parseInt(id)
  }
}



chrome.runtime.onMessage.addListener(function (request) {
  //  if attribute message in request exists, it's a gpt-3 response
  var id_popup = checkIdPopup(request.id_popup);
  // check if request.uuid exists
 
  if (request.message == 'showPopUp') {
    popUpShadow.ids++; // increment the number of popups, and id of the new popup
    popUpShadow.listOfActivePopups.push(popUpShadow.ids);
    popUpShadow.listOfUnpinnedPopups.push(popUpShadow.ids);
    setmousePositionToPopup();
    popUpShadow.defaultpopup(); // show the popup
    addListenersForDrag();
  }
  else if (request.message == 'showPopUpOnTheFly') {
    popUpShadow.ids++;
    popUpShadow.listOfActivePopups.push(popUpShadow.ids);
    popUpShadow.listOfUnpinnedPopups.push(popUpShadow.ids);
    setmousePositionToPopup();
    popUpShadow.ontheflypopup(request.text)
    addListenersForDrag();
  }

  else if (request.message == 'GPTprompt') {
    popUpShadow.updatePopupHeader(request, id_popup);
  }
  else if (request.message == 'GPTStream_completion') {
    // split over 'data: ' in case there are multiple streams concatenated
    var data = request.text.split('data: ');
    if (popUpShadow.stop_stream == true && popUpShadow.listOfUndesiredStreams.indexOf(request.uuid) == -1) {
      console.log('Stop stream with uuid',request.uuid)
      popUpShadow.listOfUndesiredStreams.push(request.uuid);
      popUpShadow.stop_stream = false;
      popUpShadow.clearnewlines = true;
    }
    // if the stream is not in the list of undesired streams, then add it to the popup
    if (popUpShadow.listOfUndesiredStreams.indexOf(request.uuid) == -1) 
    {
      for (var m = 1; m < data.length; m++) 
      {// in case of multiple stream in one, loop over them
        if (data[m].indexOf("[DONE]") == -1) 
          { // if there is not "[DONE]" in the text, it`s a stream
            var json = JSON.parse(data[m]);
            // var stream_id = json.id;
            popUpShadow.updatepopup(json, id_popup, true);
          }
        else 
          {popUpShadow.updatepopup(request, id_popup, false); }// the end of the stream, [DONE]
      }
    }
    // in case of error, the split will not produce more than one element
    if (data.length == 1) {
      //convert request.text to JSON
      var json = JSON.parse(request.text);
      if (json.error) {
        popUpShadow.updatepopup(json, id_popup, true);
        // addListenersForDrag();
      }
    }
  }
  else {
    alert(request)
  }
});
  





console.log('GPT-prompter content script is running')