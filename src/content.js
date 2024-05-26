const popUpShadow = document.createElement("mini-popup");
document.body.appendChild(popUpShadow); //attach the shadowDOM to body

// Listen to scroll event
window.addEventListener("scroll", function () {
  const x = window.scrollX,
    y = window.scrollY;
  popUpShadow.listOfUnpinnedPopups.forEach((id) => {
    // show the button to pin the popup
    const pinButton = popUpShadow.shadowRoot.getElementById(`pin${id}`);
    // make it unhidden
    // if it is already unhidden, do nothing
    if (pinButton.hasAttribute("hidden")) {
      pinButton.removeAttribute("hidden");
    }
    const elem = popUpShadow.shadowRoot.getElementById(parseInt(id));
    const elemTop = elem.offsetTop - (y - this.window.lastY);

    const elemLeft = elem.offsetLeft - (x - this.window.lastX);
    elem.style.top = `${elemTop}px`;
    elem.style.left = `${elemLeft}px`;
  });
  this.window.lastY = y;
  this.window.lastX = x;
});

const getSelectedText = () => window.getSelection().toString();

document.addEventListener("contextmenu", () => {
  if (getSelectedText().length > 0) {
    setMousePosition("mousePosition_primary", getMarkerPosition());
  }
});

document.addEventListener("contextmenu", function (e) {
  var mousePos = getMousePosition(e);
  setMousePosition("mousePosition_support", {
    left: mousePos.x,
    top: mousePos.y,
  });
});

function addListenersForDrag() {
  popUpShadow.listOfActivePopups.forEach((id) => {
    const elem = popUpShadow.shadowRoot.getElementById(`${id}grabbable`);
    // check if I am hovering ${id}temperature"
    elem.addEventListener("mousedown", mouseDown, false);
  });
}

let offsetX, offsetY;

function mouseDown(e) {
  // check if I am hovering ${id}temperature"
  if (e.target.id.includes("temperature")) {
    return;
  }
  e.preventDefault(); // prevent the selection of the text below the popup
  const id = this.id;
  // set element id width to auto

  offsetX = undefined;
  offsetY = undefined;
  const wrapper = (event) => {
    spanMove(event, id);
  };
  window.addEventListener("mousemove", wrapper, true);
  // add a listener to the mouse up event, to remove the wrapper function when the mouse is up
  window.addEventListener(
    "mouseup",
    () => {
      window.removeEventListener("mousemove", wrapper, true);
    },
    false
  );
}

function spanMove(e, id) {
  const fullPopup = popUpShadow.shadowRoot.getElementById(id.replace("grabbable", ""));
  // fullPopup.style.width = 'auto';
  if (!offsetX && !offsetY) {
    offsetX = e.clientX - fullPopup.offsetLeft;
    offsetY = e.clientY - fullPopup.offsetTop;
  }

  const mouseYPosition = e.clientY - offsetY;
  const mouseXPosition = e.clientX - offsetX;
  fullPopup.style.top = `${mouseYPosition}px`;
  fullPopup.style.left = `${mouseXPosition}px`;
}

// MOUSE POSITION FUNCTIONS

// Returns an object with x and y properties representing the mouse position
function getMousePosition(event) {
  const { clientX, clientY } = event || window.event;
  return {
    x: clientX,
    y: clientY,
  };
}

// Sets the name attribute of the popUpShadow element to the stringified mousePosition object
function setMousePosition(nameAttribute, mousePosition) {
  popUpShadow.setAttribute(nameAttribute, JSON.stringify(mousePosition));
}

// Returns an object with left and top properties representing the position of the selected text
function getMarkerPosition() {
  const rangeBounds = window.getSelection().getRangeAt(0).getBoundingClientRect();
  return {
    left: rangeBounds.right + 5,
    top: rangeBounds.top,
  };
}

// Sets the mousePosition attribute of the popUpShadow element to the appropriate attribute, or a default value if none exists
function setMousePositionToPopup() {
  if (popUpShadow.hasAttribute("mousePosition_primary")) {
    popUpShadow.setAttribute("mousePosition", popUpShadow.getAttribute("mousePosition_primary"));
    popUpShadow.removeAttribute("mousePosition_primary");
  } else if (popUpShadow.hasAttribute("mousePosition_support")) {
    popUpShadow.setAttribute("mousePosition", popUpShadow.getAttribute("mousePosition_support"));
    popUpShadow.removeAttribute("mousePosition_support");
  } else {
    popUpShadow.setAttribute("mousePosition", JSON.stringify({ left: 0, top: 0 }));
  }
}

// Returns the id as an integer, or the ids property of the popUpShadow element if id is undefined or -1
function checkIdPopup(id) {
  return id === undefined || id === -1 ? popUpShadow.ids : parseInt(id);
}

const buffers = {};

function handleDataChunk(uuid, dataChunk, request) {
  // Initialize buffer for this uuid if not already present
  buffers[uuid] = buffers[uuid] || "";

  // Datachunk is a sequence of newline-separated JSON objects, but may be split across multiple chunks
  var new_objects_added = 0;
  for (const line of dataChunk.split("\n")) {
    // Append the new chunk to the appropriate buffer
    parsed_line = line.replace(/^data: /, "");
    if (parsed_line.length != 0) {
      buffers[uuid] += parsed_line + "\n";
      new_objects_added += 1;
      // console.log("Newly added:", line.replace(/^data: /, ""));
    }
  }
  // console.log("Current buffer:", buffers[uuid]);

  for (let i = 0; i < new_objects_added; i++) {
    // Attempt to find a complete JSON object in the buffer
    const endOfObjectPos = buffers[uuid].indexOf('}\n{');
    if (endOfObjectPos !== -1) {
      // Extract the complete JSON object from the buffer
      const completeJsonObjectStr = buffers[uuid].substring(0, endOfObjectPos + 1);

      // Process the complete JSON object
      processJsonObject(completeJsonObjectStr, uuid, request);

      // Remove the processed data from the buffer
      buffers[uuid] = buffers[uuid].substring(endOfObjectPos + 2);
    }
  }
  if (buffers[uuid].includes("[DONE]")) {
    processJsonObject("[DONE]", uuid, request);
  }
}
function sendStopSignal(request,uuid) {
  console.log(`Sending stop signal for ${uuid}`);
  popUpShadow.updatepopup(request, uuid, false);
}

function processJsonObject(jsonStr, uuid, request) {
  // console.log("jsonStr:", jsonStr, uuid, request);
  try {
      // Check for the [DONE] marker
      if (jsonStr === "[DONE]") {
        console.log("Received [DONE] marker for", uuid);
        popUpShadow.updatepopup(request, uuid, false);
        return;
      }

      // Otherwise, parse and process the JSON object
      // console.log("About to process JSON.");
      const jsonObject = JSON.parse(jsonStr);
      // console.log(`Processing JSON object for ${uuid}:`, jsonObject);
      
      // Check for an error property in the JSON object
      // if (jsonObject.error) {
      //     console.log(`Error found for ${uuid}:`, jsonObject.error);
      //     popUpShadow.updatepopup(jsonObject, uuid, true);
      //     return;
      // }

      popUpShadow.updatepopup(jsonObject, uuid, true);  // Assuming uuid maps to idPopup

      // Once a valid JSON object has been processed, send a stop signal
      // sendStopSignal(request,uuid);

  } catch (e) {
      console.error("Failed to parse JSON object:", e);
      console.log(jsonStr);
  }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Full request:", request);
  if (request.greeting === "shouldReenableContextMenu") {
    sendResponse({ farewell: "yes" });
    return;
  }

  if (request.getSelection) {
    sendResponse({ selection: window.getSelection().toString() });
    return;
  }

  const idPopup = checkIdPopup(request.id_popup);
  const handleShowPopUp = () => {
    popUpShadow.ids += 1;
    popUpShadow.listOfActivePopups.push(popUpShadow.ids);
    popUpShadow.listOfUnpinnedPopups.push(popUpShadow.ids);
    setMousePositionToPopup();
  };

  switch (request.message) {
    case "showPopUp":
      handleShowPopUp();
      popUpShadow.defaultpopup();
      addListenersForDrag();
      break;
    case "showPopUpOnTheFly":
      handleShowPopUp();
      popUpShadow.ontheflypopup(request.text, request.bodyData, request.cursorPosition);
      addListenersForDrag();
      break;
    case "showPopUpChatGPT":
      handleShowPopUp();
      console.log("ChatGPT");
      popUpShadow.chatGPTpopup(request.text, request.bodyData, request.cursorPosition);
      addListenersForDrag();
      break;
    case "GPTprompt":
      popUpShadow.updatePopupHeader(request, idPopup);
      break;
    case "GPTStream_completion":
      try {
        // console.log("Request:", request);
        // console.log(popUpShadow.stop_stream, popUpShadow.listOfUndesiredStreams);
        if (popUpShadow.stop_stream && !popUpShadow.listOfUndesiredStreams.includes(request.uuid)) {
          console.log("Stop stream with uuid", request.uuid);
          popUpShadow.listOfUndesiredStreams.push(request.uuid);
          delete buffers[request.uuid];  // Clear the buffer for this stream
          popUpShadow.stop_stream = false;
          popUpShadow.clearnewlines = true;
        }
        if (!popUpShadow.listOfUndesiredStreams.includes(request.uuid)) {
          handleDataChunk(request.uuid, request.text, request);
          // processJsonObject(request.text,idPopup,  request);
        }
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      alert(request);
      break;
  }
});

console.log("GPT-prompter content script is running");
