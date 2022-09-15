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




const minipopup = (id, { display = "none", left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
<div id="${id}prompt" class="popupprompt"></div>
<p id="${id}text" style="clear: left!;cursor: text!important"></p>
</div>
`;


const flypopup = (id, { text = "none", left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px; width:50%!important">
<div id="${id}prompt" class="popupprompt" style=" justify-content: flex-end;">
</div>
<div contentEditable="true" id="${id}textarea">${text}</div>
<button type="button", id="${id}run">Run</button>
<p id="${id}text" style="clear: left!;cursor: text!important"></p>
</div>
`;


const styled = `
  .popupprompt {
    display: flex!important;
    cursor: grab!important;
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
    border: none;
    color: #fff;
    display: block;
    justify-content:center;
    opacity:0;
    position:fixed;
    width:auto;
    max-width:500px;
    z-index:-1;
    line-height:1.8;
    // font-size:18px;
    margin-right:10px!important;
    min-width: auto;!important;
    // font-family: 'Roboto', sans-serif!important;
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
  }

  .miniclose{
    color: #fff;
    background-color: #000;
    cursor: pointer;
  }
`;

class CustomMiniPopup extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get markerPosition() {
    return JSON.parse(this.getAttribute("markerPosition") || "{}");
  }

  // get styleElement() {
  //   return this.shadowRoot.querySelector("style");
  // }

  // get highlightTemplate() {
  //   return this.shadowRoot.getElementById("highlightTemplate" + (this.ids - 1));
  // }

  static get observedAttributes() {
    return ["markerPosition"];
  }

  render() {
    this.attachShadow({ mode: "open" }); // here we create the shadow DOM
    const style = document.createElement("style");
    style.textContent = styled;
    this.shadowRoot.appendChild(style); // here append the style to the shadowRoot    
    this.ids = 0;
    this.tokens = 0;
    //set attribute "usecornerPopUp" to false
    this.usecornerPopUp = false;
  }

  //   this function update the style in shadow DOM with the new markerPosition
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "markerPosition") {
      if (this.markerPosition.left + 150 > window.innerWidth) {
        var position = this.markerPosition
        position.left = window.innerWidth - 150
        this.lastpop = minipopup(this.ids + 1, position);
      }
      else { this.lastpop = minipopup(this.ids + 1, this.markerPosition); }
    }
  }



  // // this function highlight the selected text
  // highlightSelection() {
  //   var userSelection = window.getSelection();
  //   for (let i = 0; i < userSelection.rangeCount; i++) {
  //     this.highlightRange(userSelection.getRangeAt(i));
  //   }
  //   window.getSelection().empty();
  //   //add event listerer to element "buttontest" to send an alert when the user click on it

  //   //convert this.ids-1 to string and use it as id of the element
  //   const id = this.ids - 1;
  //   document.getElementById('asdjfhglk' + id).addEventListener("click", () => {
  //     this.shadowRoot.getElementById(id).classList.toggle('show');
  //   });

  // }

  // highlightRange(range) {
  //   this.shadowRoot.innerHTML += template(this.ids - 1);
  //   const clone =
  //     this.highlightTemplate.cloneNode(true).content.firstElementChild;
  //   clone.appendChild(range.extractContents()); // extract the selected text and append it to the clone
  //   range.insertNode(clone);
  // }

  // in case one is on the pdf page (or one where we can`t get the position of the selected text),
  // we just use a popup to show the text in a top left corner

  defaultpopup() {
    this.shadowRoot.innerHTML += this.lastpop
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
  }

  cornerpopup() {
    this.usecornerPopUp = true;
    this.shadowRoot.innerHTML += minipopup(this.ids, { display: "flex", left: 0, top: 0 });
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
  }
  ontheflypopup(selectionText) {
    // const fixedId = this.ids;
    this.shadowRoot.innerHTML += flypopup(this.ids, { text: selectionText, left: 0, top: 0 });
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
    // this.runClick(fixedId);
  }

  minimizeButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target + "text").classList.toggle('hide');
    });
  }
  closeButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target).classList.toggle('show');
    });
  }

  doubleClick(id_target) {
    this.shadowRoot.getElementById(id_target).addEventListener("dblclick", () => {
      this.shadowRoot.getElementById(id_target).classList.toggle('expand');
    });
  }

  runClick(id_target) {
    // if id_target + "run" has no listener, add one
    if (!this.shadowRoot.getElementById(id_target + "run").hasEventListener) {

      this.shadowRoot.getElementById(id_target + "run").addEventListener("click", () => {
        this.shadowRoot.getElementById(id_target + "text").innerHTML = "";
        console.log('Prompt on-the-fly launched from',id_target)
        var promptDict = {
          "prompt": this.shadowRoot.getElementById(id_target + "textarea").innerHTML,
          "model": "text-davinci-002",
          "temperature": 0.1,
          "max_tokens": 1000,
          "popupID": id_target,
        }
        chrome.runtime.sendMessage({ text: "launchGPT", prompt: promptDict});
        
        // erase the text in the popup
        
      });
    }
  
  }


  buttonForPopUp(do_also_runs) {
    for (let id_target = 1; id_target <= this.ids; id_target++) {
      // const id_target =this.ids
      const id_close = "mclose" + id_target;
      const id_minimize = "minimize" + id_target;
      this.minimizeButtons(id_target, id_minimize);
      this.closeButtons(id_target, id_close);
      this.doubleClick(id_target + "prompt");
      //if the element with id id_target + "run" exists

      //if the element with id id_target + "run" exists
      

      if (do_also_runs && this.shadowRoot.getElementById(id_target + "run")) {
        this.runClick(id_target);
      }
    };
  }

  updatepopup_onlypromt(request, target_id, upper_target) {
    if (target_id < 0) {
      var id2 = this.ids;
      var do_also_run_button = true;
    }
    else {
      var id2 = target_id;
      var do_also_run_button = false;
    }
    console.log(id2)
    // const id2 = this.ids; // which popup is the last one
    var id_close = "mclose" + id2
    var id_minimize = "minimize" + id2
    //add the message to the popup in the element with id2+'prompt'
    // console.log(request.body_data)
    var symbol = symbolFromModel(request.body_data.model)

    var minimcloseButtons = "<div style='width: 15%;min-width: 80px;text-align: right;'>\
    <button class='miniclose'style='margin-left:5px; font-size:15px' id='"+ id_minimize + "'>&#128469;&#xFE0E;</button>\
    <button class='miniclose' style='margin-left:5px; font-size:15px' id='" + id_close + "'>&#128473;&#xFE0E;</button> </div>";
    if (upper_target == "prompt") {
      var html_injection = "<div style='width: 85%'>" + symbol + "<i> " + request.text + "</i></div>";
    }
    else if (upper_target == "textarea") {
      var html_injection = ' Fast prompt on-the-fly';
    }

    this.shadowRoot.getElementById(id2 + "prompt").innerHTML = html_injection

    this.shadowRoot.getElementById(id2 + "prompt").innerHTML += minimcloseButtons;
    console.log(id2,do_also_run_button)
    this.buttonForPopUp(do_also_run_button); // connect the buttons of the popup
    
  }

  updatepopup(message, target_id, stream) {
    if (target_id < 0) {
      var id2 = this.ids;
    }
    else {
      var id2 = target_id;
    }
    // console.log("updatepopup", id2, target_id, this.ids)
    // TODO: Update the two buttons to two icons, one for minimize and one for close

    //if stream is true
    if (stream) {
      // if choiches is a key in message, it means usual stream
      if (message.choices) {
        var text = message.choices[0].text
        this.shadowRoot.getElementById(id2 + "text").innerHTML += text;
      }
      // if message has a key "error"
      else if (message.error) {
        var text = message.error.message
        var type = message.error.type
        this.shadowRoot.getElementById(id2 + "text").innerHTML += type + "<br>" + text;
      }
      // each message should be 1 token
      this.tokens++;

    }
    else {
      var complete_answer = this.shadowRoot.getElementById(id2 + "text").innerHTML
      // this.shadowRoot.getElementById(id2).innerHTML += 
      //loop over number of ids

      //save prompt to local storage 

      var body_data = JSON.parse(message.body_data)
      var model = body_data.model
      var cost = computeCost(this.tokens, model)
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

window.customElements.define("mini-popup", CustomMiniPopup);


