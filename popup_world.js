// import symbolFromModel from './sharedfunctions.js'; //TODO:fix this
const models = {
  "text-davinci-003": "ↁ",
  "text-davinci-002": "🅳",
  "text-curie-001": "🅲",
  "text-babbage-001": "🅑",
  "text-ada-001": "🅐",
  "code-davinci-002": "🆇"
}

function symbolFromModel(model) {
  // check if the model is in the dictionary
  if (models.hasOwnProperty(model)) {
    return models[model];
  }
  return null;
}


// const highlightColor = "#d2f4d3";//"rgb(16, 163, 255)";
const DaVinciCost = 0.02 / 1000;
const CurieCost = 0.002 / 1000;
const BabbageCost = 0.0005 / 1000;
const AdaCost = 0.0004 / 1000;


function computeCost(tokens, model) {
  var cost = 0;
  if (model == "text-davinci-003")
    cost = tokens * DaVinciCost;
  else if (model == "text-davinci-002")
    cost = tokens * DaVinciCost;
  else if (model == "text-curie-001")
    cost = tokens * CurieCost;
  else if (model == "text-babbage-001")
    cost = tokens * BabbageCost;
  else if (model == "text-ada-001")
    cost = tokens * AdaCost;
  return cost.toFixed(5);
}


// 

const minipopup = (id, { left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
    <div id="${id}grabbable" class="grabbable">
      <div style='position:relative; z-index:3; float:right; height:30px'>
        <span class='minibuttons symbolmodel' id="${id}temptext" style="cursor: default;" title="Temperature"></span>
        <input type="range" class="minibuttons tempslider" id="${id}temperature"  min="0" max="1" step="0.01"  title="Temperature">
        <button class='minibuttons symbolmodel' id="${id}symbol"></button>
        <button class='minibuttons regeneratebutton' id="regenerate${id}" title="Regenerate prompt (Alt+Enter)" hidden></button>
        <button class='minibuttons pinbutton' id="pin${id}" title="Pin the popup" hidden></button>
        <button class='minibuttons minimize-button' id="minimize${id}" title="Minimize/maximize completion"></button>
        <button class='minibuttons close-button' id="mclose${id}"  title="Close popup (Esc)"></button>
      </div>
      <div id="${id}header" class="promptheader" style="white-space: pre-wrap;" title=" Double-click to expand">
      </div>
    </div>
  </div>
  <div id="${id}completion">
    <p id="${id}text" class='popupcompletion'></p>
    <div style="float:right">
      <span id="${id}probability" class="tkn_prb"></span>
      <button class='minibuttons copybutton hide' id='copy_to_clipboard${id}' style="cursor: copy;" title='Copy completion to clipboard (Alt+C)'></button>
    </div>
  </div>
</div>
`;


const flypopup = (id, { text = "none", left = 0, top = 0, symbol = "ↁ" }) => `
<div class="popuptext onylonthefly" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
    <div id="${id}grabbable" class="grabbable">
      <div style='position:relative; z-index:3; float:right; height:30px'>
        <span class='minibuttons symbolmodel' id="${id}temptext" style="cursor: default;" title="Temperature"></span>
        <input type="range" class="minibuttons tempslider" id="${id}temperature"  min="0" max="1" step="0.01"  title="Temperature">
        <button class='minibuttons symbolmodel' id="${id}symbol">${symbol}</button>
        <button class='minibuttons pinbutton' id="pin${id}" title="Pin the popup" hidden></button>
        <button class='minibuttons minimize-button' id="minimize${id}" title="Minimize/maximize completion"></button>
        <button class='minibuttons close-button' id="mclose${id}"  title="Close popup (Esc)"></button>
      </div>
      <div id="${id}header" class="promptheader" title="Double-click to expand">
          <b>Prompt On-the-Fly</b> (<b>Alt+P</b> - Open , <b>Alt+Enter</b> - Submit, <b>Esc</b> - Close)
      </div>
    </div>
  </div>
  <div id="${id}completion">
  <div>
  <textarea contentEditable="true" id="${id}textarea" class='textarea'>${text}</textarea>
  </div>
    <button type="button" id="${id}submit" class="submitbutton" title="Alt+Enter">Submit</button>
    <button type="button" id="${id}stop" class="submitbutton hide" title="Alt+Enter" style='background-color: red;'>Stop</button>
    <button type="button" id="${id}add2comp" class="submitbutton hide" style=" width: 65px;" title="Alt+A">Add &#8682;</button>
    <p id="${id}text" class='popupcompletion'></p>
    <div style="float:right">
      <span id="${id}probability" class="tkn_prb" ></span>
      <button class='minibuttons copybutton hide' id='copy_to_clipboard${id}' style="cursor: copy;" title='Copy completion to clipboard (Alt+C)'></button>
    </div>
    </div>
</div>
`;


const styled = `
.tkn_prb {
  color: #777676;
  float: left; 
  margin-bottom: 0em; 
  margin-top: 0.25em;
  margin-right: 0.5em;
}

@font-face {
  font-family: 'Material Icons';
  src: url('https://fonts.googleapis.com/icon?family=Material+Icons');
}

.close-button:before  {
  font-family: 'Material Icons';
  content: '\u2715';
}
.minimize-button:before {
  font-family: 'Material Icons';
  content: '\uD83D\uDDD5';
}
.minimize-button.expanded:before {
  font-family: 'Material Icons';
  content: '\uD83D\uDDD6';
}
.copybutton:before {
  font-family: 'Material Icons';
  content: '\uD83D\uDCCB';
}
.pinbutton:before {
  font-family: 'Material Icons';
  content: '\uD83D\uDCCC';
}

.regeneratebutton:before {
  font-family: 'Material Icons';
  content: "\u21BB";
}

.promptheader:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0.6em, #202123 2.8em);
  z-index: 1;
  }

.copybutton {
  float:right;
  margin-bottom: -1em;
}

.textarea{
    border: 1px solid #bbbbbb;
    margin-bottom:10px;
    margin-top:10px;
    white-space: nowrap;
    display: inline-block;
    width: -webkit-fill-available;
    heigth: -webkit-fill-available;
    background-color: #202123;
    font-family: 'Roboto', sans-serif!important;
    color: #fff;
    resize: none;
    overflow: hidden;
    max-width:900px;
}
}
.textarea:focus{
    border: 1px solid #ffffff;
}
  
.textarea:hover {
    background-color: #333333; /* slightly lighter background color */
}
.textarea::placeholder {
  color: lightgray;
}

.symbolmodel {
  color: #3ee2ba!important; 
}

.grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  color: #3ee2ba;
  display: block; 
  justify-content: space-between; 
  position: relative;
}
.grabbable:hover {
  background-color: #282828; /* slightly lighter background color */
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
.submitbutton {
  background-color: #10a37f;
  color: white;
  border: white;
  border-radius: 5px;
  padding: 6px 12px;
  padding-top: 6px;
  padding-right: 12px;
  padding-bottom: 6px;
  padding-left: 12px;
  width: 100px;
  height: 30px;
}
.submitbutton:hover {
  background-color: #0f8e6c;
}
.onylonthefly{
  border: 2px solid rgb(16, 163, 127);
}
.popupcompletion {
  clear: left;
  cursor: text;
  white-space: pre-wrap;
  margin-block-end: 0em;
}
.popupprompt {
  height: 2.6em;
  overflow-y: hidden;
}
.expand {
  height: auto;
  min-height: 2.6em;
}
.popuptext {
  align-items: center;
  background-color: #202123;
  border-radius: 20px;
  color: #fff;
  display: block;
  justify-content:center;
  
  opacity:0;
  position:fixed;
  width:auto;
  min-width:300px;
  max-width:900px;
  max-height: -webkit-fill-available;
  z-index: 10001;
  line-height:1.4;
  margin-right:10px!important;
  font-size: 14px;
  font-family: 'Roboto', sans-serif!important;
  resize:horizontal;
  overflow:auto;
  transform: scale(0);
  transform-origin: top left;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.show {
  opacity: 0.9;
  padding: 15px;
  transform: scale(1);
}
.hide {
  display: none;
  height: auto;
}

.minibuttons{
  color: #fff;
  background-color: #000;
  cursor: pointer; 
  font-size:15px;
  border-radius: 8px;
  z-index: 2;
  height:100%;
}
.minibuttons:hover{
  background-color: #333333;
}
.invertcolor{
  color:  #000;
  background-color:#fff!important;
}
.highlighted-text {
  background-color: #175043;
}
.tempslider {
  width: 30px;
  height: 10px;
  transition: all 0.3s ease-in-out;
  }
.tempslider:hover {
    width: 100px;
  }
input[type=range] {
    -webkit-appearance: none;
    background-color: rgb(100, 100, 100);
  }
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 15px;
  background-color: var(--thumb-color);
  overflow: visible;
  cursor: pointer;
  border: 3px solid #10a37f;
`;

class popUpClass extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get mousePosition() {
    return JSON.parse(this.getAttribute("mousePosition") || "{}");
  }

  static get observedAttributes() {
    return ["mousePosition"];
  }

  render() {
    this.attachShadow({ mode: "open" }); // here we create the shadow DOM
    const style = document.createElement("style");
    style.textContent = styled;
    this.shadowRoot.appendChild(style); // here append the style to the shadowRoot    
    this.ids = 0;
    this.tokens = 0;
    this.probabilities = [];
    this.showProbabilities = true;
    this.clearnewlines = true;
    this.listOfActivePopups = [];
    this.listOfUnpinnedPopups = [];
    this.listOfUndesiredStreams = [];
    this.stream_on = false;
    this.stop_stream = false;
    this.alreadyCalled = {};
  }

  //   this function update the style in shadow DOM with the new mousePosition. TO REVIEW
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "mousePosition") {
      if (this.mousePosition.left + 150 > window.innerWidth) {
        var position = this.mousePosition
        position.left = window.innerWidth - 150
        this.lastpop = minipopup(this.ids, position);
      }
      else { this.lastpop = minipopup(this.ids, this.mousePosition); }
    }
  }
  defaultpopup() {
    // Create a new element to hold the pop-up
    const popUpElement = document.createElement('div');
    popUpElement.innerHTML = this.lastpop;

    // Append the new element to the shadow root
    this.shadowRoot.appendChild(popUpElement);

    // Toggle the 'show' class on the element with the ID specified in this.ids
    setTimeout(() => { this.shadowRoot.getElementById(this.ids).classList.toggle('show'); }, 10);
    // Set up event listeners for the buttons and other actions
    this.buttonForPopUp(this.ids);
  }

  ontheflypopup(selectionText, bodyData, cursorPosition) {
    // Create a new element to hold the pop-up

    const popUpElement = document.createElement('div');
    popUpElement.innerHTML = flypopup(this.ids, {
      text: selectionText,
      left: this.mousePosition.left,
      top: this.mousePosition.top,
      symbol: symbolFromModel(bodyData.model)
    });


    // Append the new element to the shadow root
    this.shadowRoot.appendChild(popUpElement);

    // toggle the 'show' class on the element with the ID specified in this.ids
    const element = this.shadowRoot.getElementById(this.ids);
    // attach the bodyData to the element
    element.bodyData = bodyData;
    this.updateTemperature(this.ids);
    this.runClick(this.ids);
    this.stopButton(this.ids);
    this.showAdd2CompletionButton(this.ids);

    // update title of <button class='minibuttons symbolmodel' id="${id}symbol"></button> inside the popup
    const symbolmodel = this.shadowRoot.getElementById(this.ids + 'symbol');
    symbolmodel.title = bodyData.model;
    // pause for 1 second to allow the popup to be rendered
    setTimeout(() => { element.classList.toggle('show'); }, 10);

    // Set up event listeners for the buttons and other actions
    this.buttonForPopUp(this.ids);

    // Get the text area element 
    const txtArea = this.shadowRoot.getElementById(this.ids + 'textarea');
    if (txtArea) {
      // Stop the event from bubbling up to the document
      txtArea.addEventListener('keydown', (e) => { e.stopPropagation();});
      // stop the event from bubbling up to the document
      txtArea.addEventListener('keyup', (e) => { e.stopPropagation();});
      txtArea.addEventListener('input', (e) => {
        txtArea.style.height = 'auto';
        txtArea.style.height = (txtArea.scrollHeight) + 'px';
        if (txtArea.scrollHeight > txtArea.offsetHeight) {
          txtArea.style.height = txtArea.scrollHeight + 'px';
        }
        if (txtArea.scrollWidth > txtArea.offsetWidth) {
          element.style.width = txtArea.scrollWidth + 'px';
        }


        // if the wideth is greate than 900px, set the  white-space: to pre-wrap
        if (txtArea.scrollWidth > 900) {
          txtArea.style.whiteSpace = 'pre-wrap';
        }
        // else {
        //   this.style.whiteSpace = 'nowrap';
        //   // this.style.width = '100%';
        // }
      });
      // trigger the input event to set the height of the text area
      txtArea.dispatchEvent(new Event('input'));
      txtArea.focus();
      txtArea.selectionEnd = txtArea.selectionStart = cursorPosition;

      // const range = document.createRange();
      // // if there is text in childNodes[0], set the cursor position to the end of the text
      // if (txtArea.childNodes[0]) {
      //   // if cursorPosition is -1 , set it to zero
      //   if (cursorPosition === -1) { cursorPosition = 0; }        

      //   // sets the start of the range to the end of the text in the text area's first child node.
      //   range.setStart(txtArea.childNodes[0], cursorPosition);
      //   //collapses the range to the cursor position.
      //   range.collapse(true);
      //   const sel = window.getSelection();
      //   sel.removeAllRanges();
      //   sel.addRange(range);
      // }
    }

  }


  pinButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      // if the element is in listOfUnpinnedPopups, remove it from there. If not, add it to the list
      if (this.listOfUnpinnedPopups.includes(id_target)) {
        this.listOfUnpinnedPopups.splice(this.listOfUnpinnedPopups.indexOf(id_target), 1);

      } else {
        this.listOfUnpinnedPopups.push(id_target);
      }
      //toggle class to invertcolor
      this.shadowRoot.getElementById(id_button).classList.toggle('invertcolor');
    });
  }


  minimizeButtons(id_target, id_button) {
    const button = this.shadowRoot.getElementById(id_button);
    button.addEventListener("click", () => {
      const element = this.shadowRoot.getElementById(id_target)
      // toggle class to minimize
      this.shadowRoot.getElementById(`${id_target}completion`).classList.toggle('hide');
      // set the height and width to auto
      element.style.height = "auto";
      element.style.width = "auto";
      button.classList.toggle('expanded');
    });
  }
  closeButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target).classList.toggle('show');
      setTimeout(() => { this.shadowRoot.getElementById(id_target).remove(); }, 500);
      // if the stream is on, stop it
      if (this.stream_on) {
        this.stop_stream = true;
        this.stream_on = false;
      }

      this.listOfActivePopups = this.listOfActivePopups.filter(item => item !== id_target);
      // remove from listOfUnpinnedPopups if it is there
      if (this.listOfUnpinnedPopups.includes(id_target)) {
        this.listOfUnpinnedPopups.splice(this.listOfUnpinnedPopups.indexOf(id_target), 1);
      }

    });
  }

  doubleClick(id_target) {
    this.shadowRoot.getElementById(id_target).addEventListener("dblclick", () => {
      this.shadowRoot.getElementById(id_target).classList.toggle('expand');
      // from id_target replace prompt with header, and get the element with the id header, toggle class nobackground
      let promptHeader = this.shadowRoot.getElementById(id_target.replace('prompt', 'header'));
      promptHeader.classList.toggle('promptheader');

    });
  }

  runClick(targetId) {
    const submitButton = this.shadowRoot.getElementById(`${targetId}submit`);

    // Add click event listener to submit button if it doesn't already have one
    if (!submitButton.listener) {
      submitButton.addEventListener("click", () => {
        this.toggleRunStop(targetId);
        this.clearProbability(targetId);
        this.resetTextElement(targetId);
        // remove hide from the id text element
        this.removeHideFromCompletion(targetId);


        const promptObj = {
          prompt: this.getTextareaValue(targetId),
          model: this.getBodyData(targetId, 'model'),
          temperature: this.getBodyData(targetId, 'temperature'),
          max_tokens: this.getBodyData(targetId, 'max_tokens'),
          popupID: targetId,
        };
        chrome.runtime.sendMessage({ text: 'launchGPT', prompt: promptObj });
        // get the textarea element
        this.resetAutoWidthTextArea(targetId);
      });
    }

    // Remove <br> from textarea
    // this.removeBRFromTextarea(targetId);

    // Add keydown event listener to textarea
    this.getTextareaElement(targetId).addEventListener("keydown", this.handleKeydown.bind(this, targetId));

    // Add alt + a keydown event listener to target element
    this.shadowRoot.getElementById(targetId).addEventListener('keydown', (event) => {
      if (event.altKey && event.key === 'a') {
        this.shadowRoot.getElementById(`${targetId}add2comp`).click();
      }
    });
  }

  resetAutoWidthTextArea(targetId) {
    const textarea = this.getTextareaElement(targetId);
    // set the width of the text are to-webkit-fill-available
    textarea.style.width = '-webkit-fill-available';
  }

  removeHideFromCompletion(targetId) {
    this.shadowRoot.getElementById(`${targetId}completion`).classList.remove('hide');
  }
  clearProbability(targetId) {
    this.shadowRoot.getElementById(`${targetId}probability`).innerHTML = '';
  }

  resetTextElement(targetId) {
    this.shadowRoot.getElementById(`${targetId}text`).innerHTML = '';
    const element = this.shadowRoot.getElementById(targetId);
    element.preText = "";
  }

  getTextareaValue(targetId) {
    return this.shadowRoot.getElementById(`${targetId}textarea`).value;
  }

  getBodyData(targetId, property) {
    return this.shadowRoot.getElementById(targetId).bodyData[property];
  }

  getTextareaElement(targetId) {
    return this.shadowRoot.getElementById(`${targetId}textarea`);
  }

  removeBRFromTextarea(targetId) {
    const textarea = this.getTextareaElement(targetId);
    textarea.addEventListener("keydown", (e) => {
      if (e.target.innerHTML.includes("<br>")) {
        e.target.innerHTML = e.target.innerHTML.replace(/<br>/g, "");
      }
    });
    this.putCursorAtTheEnd(textarea);
  }

  handleKeydown(targetId, e) {
    if (e.key === 'Escape') {
      this.closePopup(targetId);
    }
    else if (e.altKey) {
      if (e.key === 'Enter') {
        this.submitOrStop(targetId);
      }
      else if (e.key === 'c') {
        this.clickCopyToClipboard(targetId);
      }
      else if (e.key === 'a') {
        this.shadowRoot.getElementById(`${targetId}add2comp`).click();
      }
    }
  }

  submitOrStop(targetId) {
    const submitButton = this.shadowRoot.getElementById(`${targetId}submit`);
    if (!submitButton.classList.contains('hide')) {
      submitButton.click();
    } else {
      this.shadowRoot.getElementById(`${targetId}stop`).click();
    }
  }

  closePopup(targetId) {
    const closePopup = this.shadowRoot.getElementById(`mclose${targetId}`);
    if (closePopup) {
      closePopup.click();
    }
  }

  clickCopyToClipboard(targetId) {
    const copyButton = this.shadowRoot.getElementById(`copy_to_clipboard${targetId}`);
    if (copyButton) {
      copyButton.click();
    }
  }


  regenerateOrRun(id_target) {
    const regenerateButton = this.shadowRoot.getElementById(`regenerate${id_target}`);
    if (regenerateButton) {
      regenerateButton.click();
    } else {
      const runButton = this.shadowRoot.getElementById(`${id_target}submit`);
      if (runButton) {
        runButton.click();
      }
    }
  }


  stopButton(id_target) {
    this.shadowRoot.getElementById(id_target + "stop").addEventListener("click", () => {
      this.stop_stream = true;
      this.toggleRunStop(id_target);

    });
  }

  toggleRunStop(id_target) {
    if (this.shadowRoot.getElementById(id_target + "submit")) {
      this.shadowRoot.getElementById(id_target + "submit").classList.toggle('hide');
      this.shadowRoot.getElementById(id_target + "stop").classList.toggle('hide');
    }
  }
  copyButtonListener(id_target) {
    this.shadowRoot.getElementById("copy_to_clipboard" + id_target).addEventListener("click", () => {
      this.copyToClipboard(this.shadowRoot.getElementById(id_target + "text").innerHTML);
      this.shadowRoot.getElementById("copy_to_clipboard" + id_target).classList.toggle('invertcolor');
      setTimeout(() => {
        this.shadowRoot.getElementById("copy_to_clipboard" + id_target).classList.toggle('invertcolor');
      }, 500);
    });
  }


  togglerModel(id_target, id_symbol) {
    this.shadowRoot.getElementById(id_symbol).addEventListener("click", () => {
      // toggle across the models, updating  element.bodyData.model
      const element = this.shadowRoot.getElementById(id_target);
      const model = element.bodyData.model;
      const symbolElement = this.shadowRoot.getElementById(id_symbol)

      if (model === "text-davinci-003") {
        element.bodyData.model = "text-davinci-002";
        symbolElement.innerHTML = models["text-davinci-002"];
      }
      else if (model === "text-davinci-002") {
        element.bodyData.model = "text-curie-001";
        symbolElement.innerHTML = models["text-curie-001"];
      }
      else if (model === "text-curie-001") {
        element.bodyData.model = "text-babbage-001";
        symbolElement.innerHTML = models["text-babbage-001"];
      }
      else if (model === "text-babbage-001") {
        element.bodyData.model = "text-ada-001";
        symbolElement.innerHTML = models["text-ada-001"];
      }
      else if (model === "text-ada-001") {
        element.bodyData.model = "code-davinci-002";
        symbolElement.innerHTML = models["code-davinci-002"];
      }
      else if (model === "code-davinci-002") {
        element.bodyData.model = "text-davinci-003";
        symbolElement.innerHTML = models["text-davinci-003"];
      }
      else { // default
        element.bodyData.model = "text-davinci-003";
        symbolElement.innerHTML = models["text-davinci-003"];
      }
      symbolElement.title = element.bodyData.model;
    });
  }

  showAdd2CompletionButton(id_target) {
    // select the ${id}text of the popup, and detect if text is added
    const mainElem = this.shadowRoot.getElementById(id_target);
    const targetNode = this.shadowRoot.getElementById(id_target + "text");
    const add2comp = this.shadowRoot.getElementById(id_target + "add2comp");
    const textarea = this.shadowRoot.getElementById(id_target + "textarea");
    // get copy to clipboard button
    const copyButton = this.shadowRoot.getElementById(`copy_to_clipboard${id_target}`);
    // let highlightId = 0;

    add2comp.addEventListener("click", () => {

      // console.log(" textarea.innerHTML", textarea.innerHTML.replace("\n", "*"));
      // console.log("preText", mainElem.preText.replace("\n", "*"));
      // console.log(" targetNode.innerHTML", targetNode.innerHTML.replace("\n", "*"));
      textarea.value += mainElem.preText + targetNode.innerText;
      mainElem.preText = '';
      targetNode.innerText = '';
      this.putCursorAtTheEnd(textarea);

      // add2comp.classList.add('hide');
      copyButton.classList.add('hide');
      // trigger input event to update the textarea
      
    });


    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) { // if text is added
          add2comp.classList.remove('hide');
        }
        else if (mutation.type === 'childList' && mutation.removedNodes.length) { // if text is removed
          add2comp.classList.add('hide');
        }
      }
    });

    const config = { childList: true };
    observer.observe(targetNode, config);

  }

  putCursorAtTheEnd(textarea) {
    const event = new Event('input');
    textarea.dispatchEvent(event);
    textarea.focus();
    textarea.selectionEnd =textarea.selectionStart = textarea.value.length;
  }

  updateTemperature(id_target) {
    // read the temperature from the element.bodyData.temperature
    const element = this.shadowRoot.getElementById(id_target);
    const temperature = element.bodyData.temperature;
    // update the temperature slider
    const temperatureSlider = this.shadowRoot.getElementById(id_target + 'temperature');
    temperatureSlider.value = temperature;
    temperatureSlider.style.setProperty("--thumb-color", `hsl(${240 - temperature * 240}, 100%, 50%)`);
    // update the temperatureSlider title
    temperatureSlider.title = "Temperature: " + temperature;
    // update the temperature listner
    temperatureSlider.addEventListener('input', function () {
      var value = this.value;
      var thumb = this.previousElementSibling;
      // parse the value as 2 decimal float
      value = parseFloat(value).toFixed(2);
      this.title = "Temperature: " + value;
      thumb.textContent = value;
      // update the temperature in the element.bodyData.temperature as float
      element.bodyData.temperature = parseFloat(value);
      //color the thumb
      this.style.setProperty("--thumb-color", `hsl(${240 - this.value * 240}, 100%, 50%)`);
    });
  }

  buttonForPopUp(id_target) {
    const id_pin = `pin${id_target}`;
    const id_close = `mclose${id_target}`;
    const id_minimize = `minimize${id_target}`;
    const id_symbol = `${id_target}symbol`;
    this.togglerModel(id_target, id_symbol)
    this.pinButtons(id_target, id_pin);
    this.minimizeButtons(id_target, id_minimize);
    this.closeButtons(id_target, id_close);
    this.doubleClick(id_target + "prompt");
    this.copyButtonListener(id_target);
    this.keysShortcuts(id_target);
  }

  keysShortcuts(id_target) {
    let popupElement = this.shadowRoot.getElementById(id_target);
    popupElement.tabIndex = -1; // allow the element to receive focus and listen to keyboard events even if it is not in the natural tab order of the document
    popupElement.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closePopup(id_target);
      } else if (event.altKey) {
        if (event.key === 'c') {
          this.clickCopyToClipboard(id_target);
        }
        else if (event.key === 'Enter') {
          this.regenerateOrRun(id_target);
          // capture the event and prevent it from bubbling up
          event.preventDefault();
        }
      }
    });
  }

  showCopyToClipboardBtn(target_id) {
    this.shadowRoot.getElementById("copy_to_clipboard" + target_id).classList.remove("hide");
  }


  updatePopupHeader(request, targetId) {
    // reset 
    this.probabilities = [];
    this.clearnewlines = true;
    this.tokens = 0;

    chrome.storage.sync.get(['advancedSettings'], (result) => {
      this.showProbabilities = result.advancedSettings.showProb;
      this.autoAdd = result.advancedSettings.autoAdd;
    });

    const element = this.shadowRoot.getElementById(targetId);
    element.bodyData = request.bodyData;
    element.text = request.text;
    element.preText = "";
    this.updateTemperature(targetId);

    const symbol = symbolFromModel(request.bodyData.model);
    this.shadowRoot.getElementById(`${targetId}symbol`).innerHTML = symbol;
    this.shadowRoot.getElementById(`${targetId}symbol`).title = request.bodyData.model;
    this.shadowRoot.getElementById(`${targetId}header`).innerHTML = `<i> ${request.text} </i>`;

    if (request.bodyData.temperature > 0 && this.shadowRoot.getElementById(`regenerate${targetId}`)) {
      this.shadowRoot.getElementById(`regenerate${targetId}`).removeAttribute('hidden');

      if (!this.alreadyCalled[targetId]) {
        this.regenerateButton(targetId, element);
        this.alreadyCalled[targetId] = true;
      }
    }
  }



  regenerateButton(targetId, element) {
    this.shadowRoot.getElementById(`regenerate${targetId}`).addEventListener("click", () => {
      if (this.stream_on == true) { this.stop_stream = true; } //stop the actual stream if it is on, and then restart it (remains on)
      const textElement = this.shadowRoot.getElementById(`${targetId}text`);
      textElement.innerHTML = "";

      this.removeHideFromCompletion(targetId);
      this.clearProbability(targetId);

      var promptDict = {
        "prompt": element.text,
        "model": element.bodyData.model,
        "temperature": element.bodyData.temperature,
        "max_tokens": element.bodyData.max_tokens,
        "popupID": targetId,
      }
      chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict });
      // remove hide from the id text element

    });
  };

  copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  computeProbability(message) {
    if (this.showProbabilities && message.choices[0].logprobs) {
      // get logprobs
      var logprobs = message.choices[0].logprobs.token_logprobs[0]
      // convert logprobs to probabilities
      var probs = Math.exp(logprobs)
      // add to list this.probabilities
      // check that probs is not NaN
      if (!isNaN(probs)) {
        this.probabilities.push(probs)
      }
    }
  }

  updateProbability(id, return_prob = false) {
    if (this.probabilities.length > 0 && this.showProbabilities) {
      const probability = 100 * this.probabilities.reduce((a, b) => a + b, 0) / this.probabilities.length;
      const tokens = this.tokens;
      this.shadowRoot.getElementById(id).innerHTML = tokens +" tokens - avg. prob.: " + probability.toFixed(2) + "%";
      if (return_prob) {
        return probability.toFixed(2);
      }
    }
  }

  updatepopup(message, target_id, stream) {
    const textarea = this.shadowRoot.getElementById(target_id + "textarea");
    const element = this.shadowRoot.getElementById(target_id);
    const promptarea = this.shadowRoot.getElementById(target_id + "text")
    var specialCase = false;
    if (textarea && this.autoAdd) {
      specialCase = true;
    }


    //if stream is true
    if (stream) {
      this.stream_on = true;
      // if choices is a key in message, it means usual stream
      if (message.choices) {
        var text = message.choices[0].text
        // if the first charcters are newlines character, we don't add it to the popup, but save it in a string
        if (this.clearnewlines && text == "\n") {
          element.preText += text;
          if (specialCase) {
            // add text to textarea
            textarea.value += text;
            element.preText = "";
          }
          return
        }
        else {
          this.computeProbability(message);
          this.updateProbability(target_id + "probability");
          this.clearnewlines = false;
          // check if element {target_id}textarea exists
          if (specialCase) {
            // add text to textarea
            textarea.value += text;
            const event = new Event('input');
            textarea.dispatchEvent(event);
          }
          else {
            // add text to usual completion
            promptarea.innerText += text;
          }
        }
      }
      // if message has a key "error"
      else if (message.error) {
        var text = message.error.message
        var type = message.error.type
        promptarea.innerHTML += type + "<br>" + text;
        this.tokens = 0;
        this.stream_on = false;
        //show run button and hide stop button
        this.toggleRunStop(target_id);

      }
      // each message should be 1 token
      this.tokens++;

    }
    else {
      // if stream is false, it means that the stream is over
      this.stream_on = false;
      // compute the probability, get average of element in this.probabilities
      const final_prob = this.updateProbability(target_id + "probability", true);
      // show run button and hide stop button
      this.toggleRunStop(target_id);
      const complete_completion = promptarea.innerText;


      //save prompt to local storage 
      const bodyData = JSON.parse(message.bodyData)
      const model = bodyData.model
      const cost = computeCost(this.tokens, model)
      // update in bodyData the final probability in logprobs
      bodyData.logprobs = final_prob + " %";
      // focus depending on the case
      if (textarea) { textarea.focus();}
      else { element.focus(); }

      if (specialCase) {
        this.putCursorAtTheEnd(textarea);
      }
      else {
        this.showCopyToClipboardBtn(target_id);
      }

      // save the completion in the history
      chrome.storage.local.get('history', function (items) {
        if (typeof items.history !== 'undefined') {
          items.history.push([JSON.stringify(bodyData), complete_completion, cost]);// add the result to the history
          chrome.storage.local.set({ 'history': items.history });
        }
        else {
          items.history = [[JSON.stringify(bodyData), complete_completion, cost]]; // initialize the history array
          chrome.storage.local.set({ 'history': items.history });
        }
      });
    }
  }


}

window.customElements.define("mini-popup", popUpClass);


