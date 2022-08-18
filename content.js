

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
    // console.log(request.text);
    var text = request.text.replace('data: ',''); // remove the "data: "
    //if text is not "[DONE]"
    // console.log(text);
    if (text.indexOf("[DONE]")==-1) {
      var json = JSON.parse(text);
      customMiniPopup.updatepopup(json, true);
      }
    else {
      // close the stream with the full request data
      customMiniPopup.updatepopup(request, false);
      addListeners();
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


// code to move the mini popup

function addListeners(){
  for (var indice = 0; indice < customMiniPopup.ids; indice++) {
    // to pass the id to mouseDown function use the following syntax:
    // customMiniPopup.shadowRoot.getElementById(i).addEventListener('mousedown', mouseDown.bind(null, i));

    elem = customMiniPopup.shadowRoot.getElementById(indice).addEventListener('mousedown',mouseDown, false);
    // add event listener to mouse up that removes the event listener from the line above
  }
  // add event listener to mouse up that removes the event listener from the line above
  // window.addEventListener('mouseup', mouseUp, false);
  
}
// to remove the listener, use the following syntax:
// customMiniPopup.shadowRoot.getElementById(i).removeEventListener('mousedown', mouseDown.bind(null, i));



function mouseDown(e)
  {console.log('mouse clicked', this.id)
  // console.log('Zero:',inde);
  // customMiniPopup.shadowRoot.getElementById(inde).addEventListener('mousemove', spanMove, true);
  const indice = this.id; 
  function wrapper(event){
    spanMove(event,indice)
  }
  window.addEventListener('mousemove',  wrapper, true);
  // add a listener to the mouse up event, to remove the wrapper function
  window.addEventListener('mouseup', function(){
    window.removeEventListener('mousemove', wrapper, true);
  }
  , false);
  }


function spanMove(e,id){
  console.log('Zero?',id)
  var object = customMiniPopup.shadowRoot.getElementById(id)


  console.log(e.clientX) // x position of the mouse pointer
  console.log(e.clientY) // y position of the mouse pointer

  // variables 
  var y_position = object.offsetTop; 
  var x_position = object.offsetLeft;

  // for loop over distance between mouse position and object position
  if (e.clientY > y_position) {
    console.log('up')
    for (var i = y_position; i < e.clientY ; i++) {
      // move the object
      
      setTimeout(function(){object.style.top = i - object.offsetHeight/2 +'px';}, 50);
    }
  }
  else {
    console.log('down')
    for (var j = y_position; j > e.clientY ; j--) {
      // move the object
      setTimeout(function(){object.style.top = j - object.offsetHeight/2 +'px';}, 50);
    }
  }
  if (e.clientX > x_position) {
    console.log('right')
    for (var k = x_position; k < e.clientX; k++) {
      setTimeout(function(){object.style.left = k - object.offsetWidth/2 +'px';}, 50);
      // wait 10ms to move the object
    }
  }
  else {
    console.log('left')
    for (var l = x_position; l > e.clientX; l--) {
      setTimeout(function(){object.style.left = l - object.offsetWidth/2 +'px';}, 50);
    }
  }

}
  