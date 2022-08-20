const highlightColor = "#d2f4d3";//"rgb(16, 163, 255)";
const DaVinciCost = 0.06 / 1000;


const minipopup = (id,{ display = "none", left = 0, top = 0 }) => `
<div class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
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
    display: flex;
    justify-content:center;
    opacity:0;
    position:fixed;
    width:auto;
    max-width:500px;
    z-index:-1;
    line-height:1.8;
    font-size:18px!important;
    margin-right:10px!important;
    min-width: auto;!important;
    font-family: 'Roboto', sans-serif!important;
    user-select: none;
  }
  .show {
    opacity: 0.9;
    -webkit-animation: fadeIn 1s;
    animation: fadeIn 1s;
    z-index: 100;
    padding: 17px;
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
  updatepopup(message, stream) {

    const id2 = this.ids - 1;
    var id_close = "mclose" + id2
    var id_minimize = "minimize" + id2
    //if stream is true
    if (stream) {
      // if innerHTML is empty, add the text to it
      // if (this.tokens == 0) {
        
      // }
      var text = message.choices[0].text
      this.tokens++;
      this.shadowRoot.getElementById(id2).innerHTML += text
    }
    else {
      var fullmessage = this.shadowRoot.getElementById(id2).innerHTML
      this.shadowRoot.getElementById(id2).innerHTML += "<div><button class='miniclose'style='margin-left:5px; font-size:20px' id='"+id_minimize+"'>v</button><button class='miniclose' style='margin-left:5px; font-size:20px' id='" + id_close + "'>x</button> </div>";
      
      // this.shadowRoot.getElementById(id2).innerHTML += 
      //loop over number of ids
      for (let i = 0; i < this.ids; i++) {
        const id_close = "mclose" + i;
        const id_minimize = "minimize"+i;
        this.shadowRoot.getElementById(id_close).addEventListener("click", () => {
          this.shadowRoot.getElementById(i).classList.toggle('show');
        });
        // add listener to undo the highlight range and change the font size to 0 to hide the text
        this.shadowRoot.getElementById(id_minimize).addEventListener("click", () => {
          this.shadowRoot.getElementById(i).classList.toggle('minimize');
        });
      }
      //save prompt to local storage 
      // now one can get the model from message.body_data.model
      var cost = this.tokens * DaVinciCost;
      cost = cost.toFixed(5);
      this.tokens = 0;
      var body_data = JSON.stringify(message.body_data)
       // save the result.choices[0].text in the storage 
      chrome.storage.local.get('history', function (items) {
          if (typeof items.history !== 'undefined') {
              items.history.push([body_data, fullmessage, cost]);// add the result to the history
              chrome.storage.local.set({ 'history': items.history });
          }
          else {
              items.history = [[body_data, fullmessage, cost]]; // initialize the history array
              chrome.storage.local.set({ 'history': items.history });
          }
      });
    }
  }
}

window.customElements.define("mini-popup", CustomMiniPopup);
