// import symbolFromModel from './sharedfunctions.js'; //TODO:fix this
var models = {
  "text-davinci-002": "🅳",
  "text-curie-001": "🅲",
  "text-babbage-001": "🅑",
  "text-ada-001": "🅐",
  "code-davinci-002": "🆇"
}
//the above function symbolFromModel can be rewritten as a dictionary
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
  if (model == "text-davinci-002")
    cost = tokens * DaVinciCost;
  else if (model == "text-curie-001")
    cost = tokens * CurieCost;
  else if (model == "text-babbage-001")
    cost = tokens * BabbageCost;
  else if (model == "text-ada-001")
    cost = tokens * AdaCost;
  return cost.toFixed(5);
}




const minipopup = (id, {left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
    <div id="${id}header" class="grabbable" style='width: 90%;'>
    </div>
    <div style='min-width: 80px; width:10%; justify-content: flex-end;'>
      <button class='miniclose' id="minimize${id}">&#128469;&#xFE0E;</button>
      <button class='miniclose' id="mclose${id}">&#128473;&#xFE0E;</button>
    </div>
  </div>
  <p id="${id}text" class='popupanswer'></p>
</div>
`;


const flypopup = (id, { text = "none", left = 0, top = 0 }) => `
<div class="popuptext onylonthefly" id="${id}" style="left: ${left}px; top:${top}px">
  <div id="${id}prompt" class="popupprompt">
    <div id="${id}header" class="grabbable" style='width: 90%;'>
    <b>Prompt on-the-fly</b>:  (Ctrl+Enter to submit to GPT)  
    </div>
    <div style='min-width: 80px; width:10%; justify-content: flex-end;'>
      <button class='miniclose' id="minimize${id}">&#128469;&#xFE0E;</button>
      <button class='miniclose' id="mclose${id}">&#128473;&#xFE0E;</button>
    </div>
  </div>
  <div contentEditable="true" id="${id}textarea" class='textarea'> ${text}</div>
  <button type="button" id="${id}submit" class="submitbutton">Submit</button>
  <p id="${id}text" class='popupanswer'></p>
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
  .popupanswer {
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
    max-width:600px;
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

  .miniclose{
    color: #fff;
    background-color: #000;
    cursor: pointer;
    margin-left:5px; 
    font-size:15px;
    border-radius: 8px;
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
    this.shadowRoot.innerHTML += this.lastpop
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
    this.buttonForPopUp();
  }
  ontheflypopup(selectionText) {
    this.shadowRoot.innerHTML += flypopup(this.ids, { text: selectionText, left: this.mousePosition.left, top: this.mousePosition.top });
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
    this.buttonForPopUp();
    this.shadowRoot.getElementById(this.ids + "textarea").focus();
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
        this.shadowRoot.getElementById(id_target + "text").innerHTML = "";
        console.log('Prompt on-the-fly launched from', id_target)
        var promptDict = {
          "prompt": this.shadowRoot.getElementById(id_target + "textarea").innerHTML,
          "model": "text-davinci-002",
          "temperature": 0.1,
          "max_tokens": 1000,
          "popupID": id_target,
        }
        chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict });

      });
      // make the same listener, but for the ctrl+enter key combination
      this.shadowRoot.getElementById(id_target + "textarea").addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.shadowRoot.getElementById(id_target + "submit").click();
        }
      }
      );
  }


  buttonForPopUp() {
    for (var i = 0; i < popUpShadow.listOfActivePopups.length; i++) {
      //
      var id_target = popUpShadow.listOfActivePopups[i];
      // const id_target =this.ids
      const id_close = "mclose" + id_target;
      const id_minimize = "minimize" + id_target;
      this.minimizeButtons(id_target, id_minimize);
      this.closeButtons(id_target, id_close);
      this.doubleClick(id_target + "prompt");
      if (this.shadowRoot.getElementById(id_target + "submit")) {
        this.runClick(id_target);
      }
    };
  }

  updatePopupHeader(request, target_id) {
    // const id2 = this.ids; // which popup is the last one
    var symbol = symbolFromModel(request.body_data.model)
    var html_injection = symbol + "<i> " + request.text + "</i>";
    this.shadowRoot.getElementById(target_id + "header").innerHTML = html_injection
  }


  updatepopup(message, target_id, stream) {
    //if stream is true
    if (stream) {
      // if choiches is a key in message, it means usual stream

      if (message.choices) {
        var text = message.choices[0].text
        // if self.tokens is the first or second and text is a new line character, we don't add it
        if (this.clearnewlines && text == "\n") {
          console.log('new line \\n skipped')
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
      }
      // each message should be 1 token
      this.tokens++;

    }
    else {
      var complete_answer = this.shadowRoot.getElementById(target_id + "text").innerHTML

      //save prompt to local storage 

      var body_data = JSON.parse(message.body_data)
      var model = body_data.model
      var cost = computeCost(this.tokens, model)
      this.clearnewlines = true;
      this.tokens = 0;
      // save the result.choices[0].text in the storage 
      chrome.storage.local.get('history', function (items) {
        if (typeof items.history !== 'undefined') {
          items.history.push([message.body_data, complete_answer, cost]);// add the result to the history
          chrome.storage.local.set({ 'history': items.history });
        }
        else {
          items.history = [[message.body_data, complete_answer, cost]]; // initialize the history array
          chrome.storage.local.set({ 'history': items.history });
        }
      });
    }
  }
}

window.customElements.define("mini-popup", popUpClass);


