// import symbolFromModel from './sharedfunctions.js'; //TODO:fix this
var models = {
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
  return "";
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
  
    <div id="${id}header" class="grabbable" style='width: 90%;'>
    </div>
    <div style='min-width: 160px; width:10%; justify-content: flex-end;'>
      <button class='minibuttons' id="regenerate${id}" title="Regenerate prompt">&#8635;&#xFE0E;</button>
      <button class='minibuttons' id="pin${id}" title="Pin the popup">&#128204;&#xFE0E;</button>
      <button class='minibuttons' id="minimize${id}" title="Minimize/maximize completion">&#128469;&#xFE0E;</button>
      <button class='minibuttons' id="mclose${id}" title="Close popup">&#128473;&#xFE0E;</button>
    </div>
  </div>
  <p id="${id}text" class='popupcompletion'></p>
</div>
`;


const flypopup = (id, { text = "none", left = 0, top = 0 }) => `
<div class="popuptext onylonthefly" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
    <div id="${id}header" class="grabbable" style='width: 90%;'>
    <b>Prompt on-the-fly</b>: (shortcuts: <b>Alt+P</b> to open , <b>Alt+Enter</b> to submit) 
    </div>
    <div style='min-width: 120px; width:10%; justify-content: flex-end;'>
      <button class='minibuttons' id="pin${id}">&#128204;&#xFE0E;</button>
      <button class='minibuttons' id="minimize${id}">&#128469;&#xFE0E;</button>
      <button class='minibuttons' id="mclose${id}">&#128473;&#xFE0E;</button>
    </div>
  </div>
  <div contentEditable="true" id="${id}textarea" class='textarea'> ${text}</div>
  <button type="button" id="${id}submit" class="submitbutton">Submit</button>
  <button type="button" id="${id}stop" class="submitbutton hide" style='background-color: red;'>Stop</button>
  <p id="${id}text" class='popupcompletion'></p>
</div>
`;


const styled = `
  .textarea{
    border: 1px solid #ffffff;
    margin-bottom:10px;
    margin-top:10px;
  }
  .grabbable {
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
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
    display: flex!important;
    height: 2em;
    overflow-y: hidden;
  }
  .expand {
    height: auto;
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
    max-width:700px;
    max-height: -webkit-fill-available;
    z-index:-1;
    line-height:1.8;
    // font-size:18px;
    margin-right:10px!important;
    font-family: 'Roboto', sans-serif!important;
    resize:both;
    overflow:auto;
  }
  .show {
    opacity: 0.9;
    z-index: 9999;
    padding: 20px;
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
  }
  .invertcolor{
    color:  #000;
    background-color:#fff;
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
    this.clearnewlines = true;
    this.listOfActivePopups = [];
    this.listOfUnpinnedPopups = [];
    this.listOfUndesiredStreams = [];
    this.stream_on = false;
    this.stop_stream = false;
    this.alreadyCalled = {};
  }

  //   this function update the style in shadow DOM with the new mousePosition
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
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');

    // Set up event listeners for the buttons and other actions
    this.buttonForPopUp(this.ids);
    }
    ontheflypopup(selectionText) {
      // Create a new element to hold the pop-up
      const popUpElement = document.createElement('div');
      popUpElement.innerHTML = flypopup(this.ids, { text: selectionText, left: this.mousePosition.left, top: this.mousePosition.top });
    
      // Append the new element to the shadow root
      this.shadowRoot.appendChild(popUpElement);
    
      // Toggle the 'show' class on the element with the ID specified in this.ids
      this.shadowRoot.getElementById(this.ids).classList.toggle('show');
    
      // Set up event listeners for the buttons and other actions
      this.buttonForPopUp(this.ids);
    
      // Get the textarea element and add a keydown event listener to it
      const id_textarea = this.shadowRoot.getElementById(this.ids + 'textarea');
      id_textarea.addEventListener('keydown', (e) => { e.stopPropagation(); });
    
      // Focus on the textarea element
      this.shadowRoot.getElementById(this.ids + "textarea").focus();
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
      this.shadowRoot.getElementById(id_target).remove();
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
    });
  }

  runClick(id_target) {
    // if id_target + "submit" has no listener, add one
    this.shadowRoot.getElementById(id_target + "submit").addEventListener("click", () => {
      // show stop button and hide run button
      this.toggleRunStop(id_target);

      this.shadowRoot.getElementById(id_target + "text").innerHTML = "";
      console.log('Prompt on-the-fly launched from', id_target)
      var promptDict = {
        "prompt": this.shadowRoot.getElementById(id_target + "textarea").innerHTML,
        "model": "text-davinci-003",
        "temperature": 0.1,
        "max_tokens": 1000,
        "popupID": id_target,
      }
      chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict });

    });
    // make the same listener, but for the ctrl+enter key combination
    this.shadowRoot.getElementById(id_target + "textarea").addEventListener("keydown", (e) => {
      if (e.altKey && e.key === 'Enter') {
        this.shadowRoot.getElementById(id_target + "submit").click();
      }
    }
    );
  }

 

  stopButton(id_target) {
    this.shadowRoot.getElementById(id_target + "stop").addEventListener("click", () => {
      console.log('Prompt on-the-fly stopped from', id_target)
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


  buttonForPopUp(id_target) {
    const id_pin = "pin" + id_target;
    const id_close = "mclose" + id_target;
    const id_minimize = "minimize" + id_target;
    this.pinButtons(id_target, id_pin);
    this.minimizeButtons(id_target, id_minimize);
    this.closeButtons(id_target, id_close);
    this.doubleClick(id_target + "prompt");
    if (this.shadowRoot.getElementById(id_target + "submit")) {
      this.runClick(id_target);
      this.stopButton(id_target);
    }
  }

 
    

  updatePopupHeader(request, target_id) {
    var symbol = symbolFromModel(request.body_data.model)
    this.shadowRoot.getElementById(target_id + "header").innerHTML = symbol + "<i> " + request.text + "</i>";
    
    if (!this.alreadyCalled[target_id] && 
      this.shadowRoot.getElementById("regenerate" + target_id)) {
      this.regenerateButton(target_id, request);
      this.alreadyCalled[target_id] = true;
    }
  }

  //to be finished
   regenerateButton(id_target,request) {
    this.shadowRoot.getElementById("regenerate" + id_target).addEventListener("click", () => {
      if (this.stream_on == true) { this.stop_stream = true;} //stop the actual stream if it is on, and then restart it (remains on)
      this.shadowRoot.getElementById(id_target + "text").innerHTML = "";
      var promptDict = {
        "prompt": request.text,
        "model":  request.body_data.model,
        "temperature":  request.body_data.temperature,
        "max_tokens":  request.body_data.max_tokens,
        "popupID": id_target,
      }
      chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict });

    });
  };

  copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  updatepopup(message, target_id, stream) {
    //if stream is true
    if (stream) 
    {this.stream_on = true;
      // if choices is a key in message, it means usual stream
      if (message.choices) {
        var text = message.choices[0].text
        // if self.tokens is the first or second and text is a new line character, we don't add it
        if (this.clearnewlines && text == "\n") {
          // console.log('new line \\n skipped from GPT stream')
          return
        }
        else {
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
      // show run button and hide stop button
      this.toggleRunStop(target_id);
      var complete_completion = this.shadowRoot.getElementById(target_id + "text").innerHTML
      // add a button to copy the text to clipboard
      this.addCopyToClipboardBtn(target_id, complete_completion);

      //save prompt to local storage 
      var body_data = JSON.parse(message.body_data)
      var model = body_data.model
      var cost = computeCost(this.tokens, model)
      this.clearnewlines = true;
      this.tokens = 0;
      // save the result.choices[0].text in the storage 
      chrome.storage.local.get('history', function (items) {
        if (typeof items.history !== 'undefined') {
          items.history.push([message.body_data, complete_completion, cost]);// add the result to the history
          chrome.storage.local.set({ 'history': items.history });
        }
        else {
          items.history = [[message.body_data, complete_completion, cost]]; // initialize the history array
          chrome.storage.local.set({ 'history': items.history });
        }
      });
    }
  }

  addCopyToClipboardBtn(target_id, complete_completion) {
    this.shadowRoot.getElementById(target_id + "text").innerHTML += "<button class='minibuttons' id='copy_to_clipboard" + target_id + "' title='Copy to clipboard'>&#x2398;&#xFE0E;</button>"; //
    this.shadowRoot.getElementById("copy_to_clipboard" + target_id).addEventListener("click", () => {
      this.copyToClipboard(complete_completion);
      // invert color for 1 second
      this.shadowRoot.getElementById("copy_to_clipboard" + target_id).classList.toggle('invertcolor');
      setTimeout(() => {
        this.shadowRoot.getElementById("copy_to_clipboard" + target_id).classList.toggle('invertcolor');
      }, 500);
    });
  }
}

window.customElements.define("mini-popup", popUpClass);


