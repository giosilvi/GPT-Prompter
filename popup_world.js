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
    
      <div id="${id}header" class="promptheader" style="white-space: pre-wrap;" title=" Double-click to expand">
      </div>
      <div style='justify-content: flex-end; display:flex!important; align-items: flex-start;  right: 0;'> 
      <button class='minibuttons symbolmodel' id="${id}symbol"></button>
        <button class='minibuttons' id="pin${id}" title="Pin the popup" hidden>&#128204;&#xFE0E;</button>
        <button class='minibuttons' id="regenerate${id}" title="Regenerate prompt (Alt+Enter)" hidden>&#8635;&#xFE0E;</button>
        <button class='minibuttons' id="minimize${id}" title="Minimize/maximize completion">&#128469;&#xFE0E;</button>
        <button class='minibuttons' id="mclose${id}" title="Close popup (Esc)">&#128473;&#xFE0E;</button>
      </div>
    </div>
  </div>
  <span id="${id}probability" style="color: #777676; float: right; line-height: .5;"></span>
  <p id="${id}text" class='popupcompletion'></p>
  <button class='minibuttons copybutton hide' id='copy_to_clipboard${id}' title='Copy to clipboard (Alt+C)'>&#x2398;&#xFE0E;</button>
  
</div>
`;


const flypopup = (id, { text = "none", left = 0, top = 0, symbol = "ↁ" }) => `
<div class="popuptext onylonthefly" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
  <div id="${id}grabbable" class="grabbable">
    <div id="${id}header" class="promptheader" title=" Double-click to expand">
     <b>Prompt On-the-Fly</b> (<b>Alt+P</b> - Open , <b>Alt+Enter</b> - Submit, <b>Esc</b> - Close)
    </div>
      <div style='justify-content: flex-end; display:flex!important; align-items: flex-start; right: 0;'>
        <button class='minibuttons symbolmodel' id="${id}symbol">${symbol}</button>
        <button class='minibuttons' id="pin${id}" title="Pin the popup" hidden>&#128204;&#xFE0E;</button>
        <button class='minibuttons' id="minimize${id}" title="Minimize/maximize completion">&#128469;&#xFE0E;</button>
        <button class='minibuttons' id="mclose${id}"  title="Close popup (Esc)">&#128473;&#xFE0E;</button>
      </div>
    </div>
  </div>
  <span contentEditable="true" id="${id}textarea" class='textarea'>${text}</span>
    <button type="button" id="${id}submit" class="submitbutton" title="Alt+Enter">Submit</button>
    <button type="button" id="${id}stop" class="submitbutton hide" title="Alt+Enter" style='background-color: red;'>Stop</button>
    <button type="button" id="${id}add2comp" class="submitbutton hide" style=" width: 65px;" title="Alt+A">Add &#8682;</button>
    <span id="${id}probability" style="color: #777676; float: right; line-height: .5;"></span>
  <p id="${id}text" class='popupcompletion'></p>
  <button class='minibuttons copybutton hide' id='copy_to_clipboard${id}' title='Copy to clipboard (Alt+C)'>&#x2398;&#xFE0E;</button>
</div>
`;


const styled = `
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
  line-height: 1;
  margin-top: -1em;
  margin-bottom: -1em;
}

.textarea{
    border: 1px solid #bbbbbb;
    margin-bottom:10px;
    margin-top:10px;
    white-space: pre-wrap;
    display: inline-block;
    width: -webkit-fill-available;
}
.textarea:focus{
    border: 1px solid #ffffff;
}
  
.textarea:hover {
    background-color: #333333; /* slightly lighter background color */
    
}
.symbolmodel {
  color: #3ee2ba!important; 
  border-radius: 16px;
}

.grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  color: #3ee2ba;
  display: flex; 
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
  min-width:200px;
  max-width:800px;
  max-height: -webkit-fill-available;
  z-index: 10001;
  line-height:1.6;
  margin-right:10px!important;
  font-family: 'Roboto', sans-serif!important;
  resize:both;
  overflow:auto;
  transform: scale(0);
  transform-origin: top left;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  
}
.show {
  opacity: 0.9;
  padding: 20px;
  transform: scale(1);
}
.hide {
  display: none;
  height: auto;
}
.resetresize {
  resize: none!important;
  height: auto!important;
  width: auto!important;
}

.minibuttons{
  color: #fff;
  background-color: #000;
  cursor: pointer;
  margin-left:5px; 
  font-size:15px;
  border-radius: 8px;
  z-index: 2;
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
      txtArea.addEventListener('keydown', (e) => { e.stopPropagation(); });
      txtArea.focus();

      const range = document.createRange();
      // if there is text in childNodes[0], set the cursor position to the end of the text
      if (txtArea.childNodes[0]) {
        // sets the start of the range to the end of the text in the text area's first child node. The position is determined by the `cursorPosition` variable plus 1.
        range.setStart(txtArea.childNodes[0], cursorPosition + 1);
        //collapses the range to the cursor position.
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    // attach the bodyData to the element
    element.bodyData = bodyData;
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
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target + "text").classList.toggle('hide');
      this.shadowRoot.getElementById(id_target).classList.toggle('resetresize');
      // toggle html in minimize button
      if (this.shadowRoot.getElementById(id_button).innerHTML == "🗕︎") {
        this.shadowRoot.getElementById(id_button).innerHTML = "&#128470;&#xFE0E;";
      }
      else {
        this.shadowRoot.getElementById(id_button).innerHTML = "&#128469;&#xFE0E;";
      }
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

        const promptObj = {
          prompt: this.getTextareaValue(targetId),
          model: this.getBodyData(targetId, 'model'),
          temperature: this.getBodyData(targetId, 'temperature'),
          max_tokens: this.getBodyData(targetId, 'max_tokens'),
          popupID: targetId,
        };
        chrome.runtime.sendMessage({ text: 'launchGPT', prompt: promptObj });
      });
    }

    // Remove <br> from textarea
    this.removeBRFromTextarea(targetId);

    // Add keydown event listener to textarea
    this.getTextareaElement(targetId).addEventListener("keydown", this.handleKeydown.bind(this, targetId));

    // Add alt + a keydown event listener to target element
    this.shadowRoot.getElementById(targetId).addEventListener('keydown', (event) => {
      if (event.altKey && event.key === 'a') {
        this.shadowRoot.getElementById(`${targetId}add2comp`).click();
      }
    });
  }


  clearProbability(targetId) {
    this.shadowRoot.getElementById(`${targetId}probability`).innerHTML = '';
  }

  resetTextElement(targetId) {
    this.shadowRoot.getElementById(`${targetId}text`).innerHTML = '';
    const element = this.shadowRoot.getElementById(targetId);
    element.preText = '';
  }

  getTextareaValue(targetId) {
    return this.shadowRoot.getElementById(`${targetId}textarea`).textContent;
  }

  getBodyData(targetId, property) {
    return this.shadowRoot.getElementById(targetId).bodyData[property];
  }

  getTextareaElement(targetId) {
    return this.shadowRoot.getElementById(`${targetId}textarea`);
  }

  removeBRFromTextarea(targetId) {
    this.getTextareaElement(targetId).addEventListener("keydown", (e) => {
      if (e.target.innerHTML.includes("<br>")) {
        e.target.innerHTML = e.target.innerHTML.replace(/<br>/g, "");
      }
    });
  }

  handleKeydown(targetId, e) {
    if (e.key === 'Escape') {
      this.closePopup(`mclose${targetId}`);
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

  closePopup(id_close) {
    this.shadowRoot.getElementById(id_close).click();
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

    add2comp.addEventListener("click", function () {
      
      // console.log(" textarea.innerHTML", textarea.innerHTML.replace("\n", "*"));
      // console.log("preText", mainElem.preText.replace("\n", "*"));
      // console.log(" targetNode.innerHTML", targetNode.innerHTML.replace("\n", "*"));
      
      textarea.innerHTML += mainElem.preText + targetNode.innerHTML;
      mainElem.preText = '';
      const range = document.createRange();
      range.selectNodeContents(textarea);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      targetNode.innerHTML = '';
      add2comp.classList.add('hide');
      copyButton.classList.add('hide');
    });


    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          add2comp.classList.remove('hide');
        }
      }
    });

    const config = { childList: true };
    observer.observe(targetNode, config);

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
    if (this.shadowRoot.getElementById(id_target + "submit")) {
      this.runClick(id_target);
      this.stopButton(id_target);
    }
    if (this.shadowRoot.getElementById(id_target + "add2comp")) {
      this.showAdd2CompletionButton(id_target);
    }

    // add a listener to escape key to close the popup
    let popupElement = this.shadowRoot.getElementById(id_target);
    popupElement.tabIndex = -1; // allow the element to receive focus and listen to keyboard events even if it is not in the natural tab order of the document
    popupElement.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closePopup(id_close);
      } else if (event.altKey) {
        if (event.key === 'c') {
          this.clickCopyToClipboard(id_target);
        }
        else if (event.key === 'Enter') {
          this.regenerateOrRun(id_target);
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
    });

    const element = this.shadowRoot.getElementById(targetId);
    element.bodyData = request.bodyData;
    element.text = request.text;
    element.preText = '';

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
      this.shadowRoot.getElementById(`${targetId}text`).innerHTML = "";
      this.clearProbability(targetId);

      var promptDict = {
        "prompt": element.text,
        "model": element.bodyData.model,
        "temperature": element.bodyData.temperature,
        "max_tokens": element.bodyData.max_tokens,
        "popupID": targetId,
      }
      chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict });
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
      this.shadowRoot.getElementById(id).innerHTML = "Tokens prob.: " + probability.toFixed(2) + "%";
      if (return_prob) {
        return probability.toFixed(2);
      }
    }
  }

  updatepopup(message, target_id, stream) {
    //if stream is true
    if (stream) {
      this.stream_on = true;
      // if choices is a key in message, it means usual stream
      if (message.choices) {
        var text = message.choices[0].text
        // if the first charcters are newlines character, we don't add it to the popup, but save it in a string
        if (this.clearnewlines && text == "\n") {
          const element = this.shadowRoot.getElementById(target_id);
          element.preText += text;
          return
        }
        else {
          this.computeProbability(message);
          this.updateProbability(target_id + "probability");
          this.clearnewlines = false;
          this.shadowRoot.getElementById(target_id + "text").innerHTML += text;
        }
      }
      // if message has a key "error"
      else if (message.error) {
        var text = message.error.message
        var type = message.error.type
        this.shadowRoot.getElementById(target_id + "text").innerHTML += type + "<br>" + text;
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
      const complete_completion = this.shadowRoot.getElementById(target_id + "text").innerHTML
      // add a button to copy the text to clipboard
      this.showCopyToClipboardBtn(target_id);

      //save prompt to local storage 
      const bodyData = JSON.parse(message.bodyData)
      const model = bodyData.model
      const cost = computeCost(this.tokens, model)
      // update in bodyData the final probability in logprobs
      bodyData.logprobs = final_prob + " %";
      // revert bodyData to string

      // save the result.choices[0].text in the storage 
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


