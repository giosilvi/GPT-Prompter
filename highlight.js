const highlightColor = "#d2f4d3";//"rgb(16, 163, 255)";
const DaVinciCost = 0.06 / 1000;
const CurieCost = 0.006 / 1000;
const BabbageCost = 0.0012 / 1000;
const AdaCost = 0.0008 / 1000;


function computeCost(tokens, model)
{
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

const minipopup = (id,{ display = "none", left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
<div id="${id}prompt" style="cursor: text!important; display:flex!important"></div>
<div id="${id}text" style="clear: left!;cursor: text!important"></div>
</div>

`;

const template = (id) => `
<template id="highlightTemplate${id}">
<span class="highlight" id="asdjfhglk${id}"  style="background-color: ${highlightColor}; display: inline; cursor: pointer"></span>
</template>
`;


const styled = `
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
    font-size:18px;
    margin-right:10px!important;
    min-width: auto;!important;
    font-family: 'Roboto', sans-serif!important;
    // user-select: none;
  }
  .show {
    opacity: 0.9;
    // -webkit-animation: fadeIn 1s;
    // animation: fadeIn 1s;
    z-index: 999;
    padding: 20px;
    cursor: grab;
  }
  .hide {
    display: none;
  }
  .minimize{
    font-size: 2px;
  }

  @-webkit-keyframes fadeIn {
    from {opacity: 0;} 
    to {opacity: 1;}
  }

  @keyframes fadeIn {
    from {opacity: 0;}
    to {opacity:1 ;}
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

  get styleElement() {
    return this.shadowRoot.querySelector("style");
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById("highlightTemplate" + (this.ids - 1));
  }

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
  }

  //   this function update the style in shadow DOM with the new markerPosition
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "markerPosition") {
      newValue = JSON.parse(newValue);
      if (newValue["display"] == "flex") {
        //if this has attribute lastpop
        this.shadowRoot.innerHTML += this.lastpop
        this.shadowRoot.getElementById(this.ids).classList.toggle('show');
        this.ids++;
      }
      else {
        if (this.markerPosition.left + 150 > window.innerWidth) {
          var position = this.markerPosition
          position.left = window.innerWidth - 150
          this.lastpop = minipopup(this.ids, position);
        }
        else { this.lastpop = minipopup(this.ids, this.markerPosition); }
      }
    }
  }
 
  // in case one is on the pdf page, we just use a popup to show the text in a top left corner
  // TO DO: it should toggle to no-text/text when the user click on the popup
  defaultpopup(){
    //check if shadowRoot element exists
    // if (this.shadowRoot.getElementById(this.ids-1)) {
    //   //cancel the element if it exists
    //   this.ids--;
    //   this.shadowRoot.getElementById(this.ids).remove();
    // }
    this.shadowRoot.innerHTML += minipopup(this.ids, { display: "flex", left: 0, top: 0 });
    this.shadowRoot.getElementById(this.ids).classList.toggle('show');
    this.ids++;
  }

  // this function highlight the selected text
  highlightSelection() {
    var userSelection = window.getSelection();
    for (let i = 0; i < userSelection.rangeCount; i++) {
      this.highlightRange(userSelection.getRangeAt(i));
    }
    window.getSelection().empty();
    //add event listerer to element "buttontest" to send an alert when the user click on it

    //convert this.ids-1 to string and use it as id of the element
    const id = this.ids - 1;
    document.getElementById('asdjfhglk' + id).addEventListener("click", () => {
      this.shadowRoot.getElementById(id).classList.toggle('show');
    });

  }

  highlightRange(range) {
    this.shadowRoot.innerHTML += template(this.ids - 1);
    const clone =
      this.highlightTemplate.cloneNode(true).content.firstElementChild;
    clone.appendChild(range.extractContents()); // extract the selected text and append it to the clone
    range.insertNode(clone);
  }

  minimizeButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target+"text").classList.toggle('hide');
    });
  }
  closeButtons(id_target, id_button) {
    this.shadowRoot.getElementById(id_button).addEventListener("click", () => {
      this.shadowRoot.getElementById(id_target).classList.toggle('show');
    });
  }


  buttonForPopUp(){
    for (let id_target = 0; id_target < this.ids; id_target++) {
        const id_close = "mclose" + id_target;
        const id_minimize = "minimize"+id_target;
        this.minimizeButtons(id_target,id_minimize);
        this.closeButtons(id_target,id_close);
        };
    }
  
  updatepopup_onlypromt(request){
    const id2 = this.ids - 1; // which popup is the last one
    var id_close = "mclose" + id2
    var id_minimize = "minimize" + id2
    //add the message to the popup in the element with id2+'prompt'
    console.log(request.body_data)
    var symbol = symbolFromModel(request.body_data.model)
    
    var minimcloseButtons = "<div style='width: 15%;min-width: 80px;text-align: right;'><button class='miniclose'style='margin-left:5px; font-size:15px' id='"+id_minimize+"'>&#128469;&#xFE0E;</button><button class='miniclose' style='margin-left:5px; font-size:15px' id='" + id_close + "'>&#128473;&#xFE0E;</button> </div>";

    this.shadowRoot.getElementById(id2+'prompt').innerHTML = "<div style='width: 85%'>"+symbol+"<i> "+request.text+"</i></div>";
    this.shadowRoot.getElementById(id2+"prompt").innerHTML += minimcloseButtons;
    this.buttonForPopUp(); // connect the buttons of the popup
  }

  updatepopup(message, stream) {

    const id2 = this.ids - 1;

    // TODO: Update the two buttons to two icons, one for minimize and one for close
    
    //if stream is true
    if (stream) {
      // if innerHTML is empty, add the text to it
      // if (this.tokens == 0) {
      // }
      // if choiches is a key in message
      if (message.choices) {
        var text = message.choices[0].text
        this.shadowRoot.getElementById(id2+"text").innerHTML += text;
      }
      // if message has a key "error"
      else if (message.error) {
        var text = message.error.message
        var type = message.error.type
        this.shadowRoot.getElementById(id2+"text").innerHTML += type + "<br>" + text;
      }
      this.tokens++;
      
    }
    else {
      var complete_answer = this.shadowRoot.getElementById(id2+"text").innerHTML
      // this.shadowRoot.getElementById(id2).innerHTML += 
      //loop over number of ids
     
      //save prompt to local storage 
      
      var body_data = JSON.parse(message.body_data)
      var model = body_data.model
      var cost = computeCost(this.tokens,model)
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


function symbolFromModel(model)
{
    var symbol = '';
    if (model == "text-davinci-002")
        symbol = '🅳';
    else if (model == "text-curie-001")
        symbol = '🅲';
    else if (model == "text-babbage-001")
        symbol = '🅑';
    else if (model == "text-ada-001")
        symbol = '🅐';
    return symbol
}