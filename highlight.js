const highlightColor = "#d2f4d3";//"rgb(16, 163, 255)";


const minipopup = (id,{ display = "none", left = 0, top = 0 }) => `
<span class="popuptext" id="${id}" style="left: ${left}px; top:${top}px">
Message incoming....
</span>
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
    border-radius: 5px;
    border: none;
    color: #fff;
    display: flex;
    justify-content: center;
    opacity: 0;
    padding: 5px 10px;
    position: fixed;
    width: auto;
    max-width: 500px;
    z-index: -1;
    line-height: 1.5;
    font-size: 18px!important;
    margin-right: 10px!important;
    min-width: auto;!important;
  }
  .show {
    opacity: 0.9;
    -webkit-animation: fadeIn 1s;
    animation: fadeIn 1s;
    z-index: 100;
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
    return this.shadowRoot.getElementById("highlightTemplate"+(this.ids-1));
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
  }

  //   this function update the style in shadow DOM with the new markerPosition
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "markerPosition") {
      newValue = JSON.parse(newValue);
      if (newValue["display"] == "flex") {
        this.shadowRoot.innerHTML += this.lastpop
        this.shadowRoot.getElementById(this.ids).classList.toggle('show');
        this.ids++;
      }
      else { if (this.markerPosition.left+150 > window.innerWidth)
        {var position = this.markerPosition
        position.left = window.innerWidth - 150
        this.lastpop=minipopup(this.ids,position);
        }
        else
        {this.lastpop=minipopup(this.ids,this.markerPosition);}
      }
    }
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
    const id = this.ids-1;
    document.getElementById('asdjfhglk'+id).addEventListener("click", () => {
      this.shadowRoot.getElementById(id).classList.toggle('show');
    });
    
      }

  highlightRange(range) {
    this.shadowRoot.innerHTML += template(this.ids-1);
    const clone =
      this.highlightTemplate.cloneNode(true).content.firstElementChild;
    clone.appendChild(range.extractContents()); // extract the selected text and append it to the clone
    range.insertNode(clone);
  }
  updatepopup(message){
    
    const id2 = this.ids-1;
    var id_close = "mclose"+id2
    this.shadowRoot.getElementById(id2).innerHTML = message + "<button class='miniclose' id='"+id_close+"'>x</button>";
    //loop over number of ids
    for (let i = 0; i < this.ids; i++) {
    const id_close = "mclose"+i;
    this.shadowRoot.getElementById(id_close).addEventListener("click", () => {
      this.shadowRoot.getElementById(i).classList.toggle('show');
    });
  }
  }
}

window.customElements.define("mini-popup", CustomMiniPopup);
