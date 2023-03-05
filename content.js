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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    case"showPopUpChatGPT":
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
        const lines = request.text
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== ""); // remove empty lines and split
        if (popUpShadow.stop_stream && !popUpShadow.listOfUndesiredStreams.includes(request.uuid)) {
          console.log("Stop stream with uuid", request.uuid);
          popUpShadow.listOfUndesiredStreams.push(request.uuid);
          popUpShadow.stop_stream = false;
          popUpShadow.clearnewlines = true;
        }
        if (!popUpShadow.listOfUndesiredStreams.includes(request.uuid)) {
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              // console.log('json', json.choices[0].logprobs.token_logprobs[0])
              popUpShadow.updatepopup(request, idPopup, false);
            } else {
              const parsed = JSON.parse(message);
              popUpShadow.updatepopup(parsed, idPopup, true);
            }
          }
        }
      } catch (e) {
        console.error(e);
        const json = JSON.parse(request.text);
        if (json.error) {
          popUpShadow.updatepopup(json, idPopup, true);
        }
      }
      break;
    default:
      alert(request);
      break;
  }
});

console.log("GPT-prompter content script is running");
