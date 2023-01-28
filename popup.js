// GENERAL FUNCTIONS

function makePromptList(items) {
    // Clear the node 'list-of-prompts'.
    var ul = document.getElementById('list-of-prompts');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    var titleExists = false;
    for (var i = 0; i < items.customprompt.length; i++) {

        var li = document.createElement('li');
        li.className = 'list-group-item draggable';
        li.setAttribute('draggable', 'true');
        li.setAttribute('id', i);

        // Create text elements for title, prompt, model, temperature, and max tokens
        var titleText = document.createElement('span');
        titleText.className = 'feature-text';
        // check if title exists
        if (items.customprompt[i]['title'] != undefined && items.customprompt[i]['title'] != '') {
            titleText.innerText = items.customprompt[i]['title'];
            titleText.setAttribute('data-title', 'Title:');
            titleExists = true;
        } else {
            titleExists = false;
        }

        var promptText = document.createElement('span');
        promptText.className = 'prompt-text';
        promptText.innerText = items.customprompt[i]['prompt'];

        var modelText = document.createElement('span');
        modelText.className = 'feature-text';
        modelText.innerText = ` ${items.customprompt[i]['model']}`;
        modelText.setAttribute('data-title', 'Model:');

        var tempText = document.createElement('span');
        tempText.className = 'feature-text';
        tempText.style.marginLeft = '25px';
        tempText.innerText = ` ${items.customprompt[i]['temperature']}`;
        tempText.setAttribute('data-title', 'Temp:');

        var maxTokensText = document.createElement('span');
        maxTokensText.className = 'feature-text';
        maxTokensText.style.marginLeft = '25px';
        maxTokensText.innerText = ` ${items.customprompt[i]['max_tokens']}`;
        maxTokensText.setAttribute('data-title', 'Max tokens:');

        // Create Add title , edit and delete buttons
        var titleButton = document.createElement('button');
        titleButton.className = 'save';
        if (titleExists) {
            titleButton.innerText = 'Edit Title';
        } else {
            titleButton.innerText = 'Add Title';
        }
        titleButton.setAttribute('id', `title${i}`);

        var editButton = document.createElement('button');
        editButton.className = 'save';
        editButton.innerText = 'Edit Prompt';
        editButton.setAttribute('id', `edit${i}`);

        var deleteButton = document.createElement('button');
        deleteButton.className = 'save';
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('id', `del${i}`);

        // Add a textare for the title, make it hidden, make it one line, and 500px wide
        var titleInsertText = document.createElement('textarea');
        titleInsertText.className = 'title-text form-control';
        titleInsertText.setAttribute('id', `title-text${i}`);
        titleInsertText.style.display = 'none';
        titleInsertText.setAttribute('rows', '1');
        titleInsertText.setAttribute('cols', '60');
        titleInsertText.setAttribute('placeholder', 'Enter title here (click away to save)');


        // Append all elements to the list item
        if (titleExists) {
            li.appendChild(titleText);
            li.appendChild(document.createElement('br'));
        }
        li.appendChild(promptText);
        li.appendChild(document.createElement('br'));
        li.appendChild(modelText);
        li.appendChild(tempText);
        li.appendChild(maxTokensText);
        li.appendChild(document.createElement('br'));
        li.appendChild(titleButton);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        li.appendChild(document.createElement('br'));
        li.appendChild(titleInsertText);

        // Append the list item to the 'list-of-prompts' node
        ul.appendChild(li);
        // Call the addEventsDragAndDrop function with the list item as the parameter
        addEventsDragAndDrop(li);
    }
    update_lower_buttons(items)
}




function update_lower_buttons(items) {
    for (var j = 0; j < items.customprompt.length; j++) {
        // add event listener to the add title button
        document.getElementById('title' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(5);
            addTitle(id);
        }, false)
        // add event listener to the edit button
        document.getElementById('edit' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(4);
            editPrompt(id);
        }, false)
        // add event listener to the delete button
        document.getElementById('del' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(3);
            erasePrompt(id);
        }, false)
    }
}

function toggleSaveKeyButton() {
    //display the element with id 'apikey' and the 'saveKey' button
    if (document.getElementById('apikey').style.display == 'none') {

        document.getElementById('apikey').style.display = 'block';
        document.getElementById('saveKey').style.display = 'block';
        document.getElementById('deleteKey').style.display = 'block';
        document.getElementById('linktoAPI').style.display = 'block';
        document.getElementById('showKey').innerHTML = 'Hide API';
        // show the API key if it exists
        chrome.storage.sync.get('APIKEY', function (items) {
            if (typeof items.APIKEY !== 'undefined') {
                // alert(items.APIKEY);
                document.getElementById('apikey').value = items.APIKEY;
            }
        }
        )
    }
    else {
        document.getElementById('apikey').style.display = 'none';
        document.getElementById('saveKey').style.display = 'none';
        document.getElementById('deleteKey').style.display = 'none';
        document.getElementById('linktoAPI').style.display = 'none';
        document.getElementById('showKey').innerHTML = 'Show API';
    }

}


function hideSaveKey() {
    //hide the element with id 'apikey' and the 'saveKey' button
    document.getElementById('apikey').style.display = 'none';
    document.getElementById('saveKey').style.display = 'none';
    document.getElementById('deleteKey').style.display = 'none';
    document.getElementById('linktoAPI').style.display = 'none';
    document.getElementById('showKey').style.display = 'block';
    document.getElementById('showKey').innerHTML = 'Show API';
}

//add function to save the the custom prompt in storage
function savePrompt() {
    document.getElementById('createPrompt').disabled = true;
    // get the text from the prompt
    var model = document.getElementById("inputmodel").value;
    var temp = parseFloat(document.getElementById("temp").value);
    var token = parseInt(document.getElementById("token").value);
    var text = document.getElementById("promptinput").value;
    var body_data = { "model": model, "temperature": temp, "max_tokens": token, "prompt": text, "echo": true, "stream": true }
    // try to retrive the custom prompt from the storage API
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            var prompt_already_present = false;
            // check that the prompt is not already present, looping over every prompt in the array and comparing each values in the dictionary
            for (var i = 0; i < items.customprompt.length; i++) {
                if (items.customprompt[i]['prompt'] == text && items.customprompt[i]['model'] == model && items.customprompt[i]['temperature'] == temp && items.customprompt[i]['max_tokens'] == token) {
                    prompt_already_present = true;
                }
            }
            var customprompt = document.getElementById('promptinput').value;

            if (prompt_already_present == false) {
                items.customprompt.push(body_data);
                makePromptList(items) //update the list of prompts
                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that we saved
                    console.log('Your custom prompt was saved.');
                })
                chrome.runtime.sendMessage({ text: "new_prompt_list" });
                document.getElementById('promptinput').value = 'Prompt created! Available in context menu (right click).';
                document.getElementById("promptinput").style.color = "#10a37f"; //green color for the prompt created
            }
            else {
                console.log('Your custom prompt was already saved.');
                var customprompt = document.getElementById('promptinput').value;

                document.getElementById('promptinput').value = 'Prompt already present! Available in context menu (right click).';
                //yellow color for the prompt created
                document.getElementById("promptinput").style.color = "#f7b500";
            }
            setTimeout(function () {
                document.getElementById('promptinput').value = customprompt
                document.getElementById("promptinput").style.color = "#495057"  //exadecimal standard color
                document.getElementById('createPrompt').disabled = false;
            }, 2000);
        } else {
            // if the prompt does not exist, create a new array with the prompt
            items.customprompt = [body_data];
        };

    });
}

//add a function to erase a custom prompt from the storage API provided the index of the prompt
function erasePrompt(index) {
    // try to retrive the custom prompt from the storage API
    console.log('erasePrompt: ' + index);
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check that the index is valid
            if (index <= items.customprompt.length) {
                // remove the prompt from the array
                items.customprompt.splice(index, 1);
                makePromptList(items); //update the list of prompts

                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that is erased
                    console.log('Your custom prompt was erased.');
                })
                chrome.runtime.sendMessage({ text: "new_prompt_list" }); // new menu list
            }
        }
    });
}

function addTitle(index) {

    // show the texttitle to the user
    let textTitle = document.getElementById(`title-text${index}`);
    textTitle.style.display = 'block';
    // put the focus on the texttitle
    textTitle.focus();
    // when the user loses the focus, save the title
    textTitle.addEventListener('blur', function () {
        saveTitle(index);
        // and hide the texttitle
        textTitle.style.display = 'none';
        chrome.runtime.sendMessage({ text: "new_prompt_list" });
    });

}

function saveTitle(index) {
    // get the text from the title
    var title = document.getElementById(`title-text${index}`).value;
    // try to retrive the custom prompt from the storage API
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check that the index is valid
            if (index <= items.customprompt.length) {
                // add the title to the prompt
                items.customprompt[index]['title'] = title;
                // save the title in the storage
                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that is saved
                    console.log('Your custom prompt title was saved.');
                })
                makePromptList(items); //update the list of prompts

            }
        }
    });
}

function editPrompt(index) {
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check that the index is valid
            if (index <= items.customprompt.length) {
                // copy the prompt from the array to the input
                document.getElementById('promptinput').value = items.customprompt[index]['prompt'];
                document.getElementById('inputmodel').value = items.customprompt[index]['model'];
                document.getElementById('temp').value = items.customprompt[index]['temperature'];
                document.getElementById('temperature').value = items.customprompt[index]['temperature'];
                document.getElementById('token').value = items.customprompt[index]['max_tokens'];
                document.getElementById('maxtoken').value = items.customprompt[index]['max_tokens'];
                // set the focus on the input
                document.getElementById('promptinput').focus();
                // document.getElementById('createPrompt').disabled = false;
                // document.getElementById('createPrompt').innerHTML = '<b>Edit prompt</b>';
                // document.getElementById('createPrompt').onclick = function () { editPrompt2(index) };
            }
        }
    });
}

// function editPrompt2(index) {
//     //call savePrompt function
//     // erasePrompt(index);
//     savePrompt();
//     // change the innerHTML of the button
//     document.getElementById('createPrompt').innerHTML = '<b>Create prompt</b>';
//     // change the onclick function of the button
//     document.getElementById('createPrompt').onclick = function () { savePrompt() };
// }



function saveKey() {
    // Get a value saved in an input
    var apiKey = document.getElementById('apikey').value;
    // Save it using the Chrome extension storage API
    chrome.storage.sync.set({ 'APIKEY': apiKey }, function () {
        // Notify that we saved
        console.log('Your API key was saved.');
    });
}

//if the user click on the toggle probabilityToggle then save the value in the storage under chrome.storage.sync.set({ 'advancedSettings': { "showProb": true or false} });
// add listener to the probabilityToggle
function addListenerToProbabilityToggle() {
    // set the value of the probabilityToggle retrieved from the storage
    chrome.storage.sync.get('advancedSettings', function (items) {
        // Check that the advanced setting  exists
        if (typeof items.advancedSettings !== 'undefined') {
            // set the value of the probabilityToggle
            document.getElementById('probabilityToggle').checked = items.advancedSettings.showProb;
        }
    });
    // add listener to the probabilityToggle
    document.getElementById('probabilityToggle').addEventListener('click', function () {
        // get the value of the probabilityToggle
        var probabilityToggle = document.getElementById('probabilityToggle').checked;
        // save the value in the storage
        chrome.storage.sync.set({ 'advancedSettings': { "showProb": probabilityToggle } }, function () {
            // Notify that we saved
            console.log('Your probabilityToggle was saved.');
        });
    });
}

function checkInputOfPromptDesigner() {
    document.getElementById('promptinput').addEventListener('keyup', onkey, false);
    function onkey(e) {
        //get the value of the input
        var inputtext = document.getElementById('promptinput').value;
        //check if "#TEXT#" doesn`t contained in inputtext
        if (inputtext.indexOf("#TEXT#") == -1) { // if not found
            //check if "#TEXT" is contained in inputtext
            if (inputtext.indexOf("#TEXT") != -1) { // if found
                //if yes, replace it with "#TEXT#"
                inputtext = inputtext.replace("#TEXT", "#TEXT#");
                // update the input
                document.getElementById('promptinput').value = inputtext;
            }
            //check if "TEXT#" is contained in inputtext
            else if (inputtext.indexOf("TEXT#") != -1) {
                //if yes, replace it with "#TEXT#"
                inputtext = inputtext.replace("TEXT#", "#TEXT#");
                // update the input
                document.getElementById('promptinput').value = inputtext;
            }
            else {
                document.getElementById('promptinput').value = "#TEXT#";
            }
        }
    }
}



//make a function that listen for event keydown on the input
document.addEventListener('DOMContentLoaded', function () {
    checkInputOfPromptDesigner();
    addListenerToProbabilityToggle();
    }
);


//LISTENERS FOR THE BUTTONS
//Load History of the custom prompts
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('history').addEventListener('click', function () {
        //access local history.html file, and modify the html
        chrome.tabs.create({ url: chrome.runtime.getURL('history.html'), active: true });
    }
    );
}
);


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveKey').addEventListener('click', onclick, false)
    function onclick() {
        //send a message to background.js to check the API key
        chrome.runtime.sendMessage({ text: "checkAPIKey", apiKey: document.getElementById('apikey').value });
    }
}, false)
//add Listenere to deleteKey button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('deleteKey').addEventListener('click', onclick, false)
    function onclick() {
        //send a message to background.js to delete the API key
        chrome.storage.sync.remove('APIKEY');
        // take the value of the input and erase it
        document.getElementById('apikey').value = 'API KEY deleted!';
        setTimeout(function () {
            document.getElementById('apikey').value = "";
        }, 2000);
        // reset the icon to the default one
        chrome.action.setIcon({ path: "icons/icon16.png" })
    }
}, false)



// Attach the click event to the respective elements
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createPrompt').addEventListener('click', savePrompt);
    document.getElementById('showKey').addEventListener('click', toggleSaveKeyButton);
    document.getElementById('linktoAPI').addEventListener('click', openLink);
    document.getElementById('linktoLogprob').addEventListener('click', openLink);
    
}, false);

function openLink() {
    chrome.tabs.create({ active: true, url: this.href });
}




// Load the list of custom prompts from the storage 
document.addEventListener('DOMContentLoaded', function () {
    //retrieve from chrome storage the custom prompt
    chrome.storage.sync.get('customprompt', function (items) {
        //if it exists send an alert
        if (typeof items.customprompt !== 'undefined') {
            makePromptList(items);
        }
    }
    )
    checkAPIKeyatBeginning();
}
    , false);



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "API_key_valid") {
        saveKey();
        chrome.action.setIcon({ path: "icons/iconA16.png" });
        document.getElementById("apikey").value = "The API KEY is valid. Hooray!";
        document.getElementById("apikey").style.color = "#10a37f"; //green color 
        setTimeout(() => {
            hideSaveKey();
            // set the color back to black
            document.getElementById("apikey").style.color = "#495057";
        }, 3000);
        //
    } else if (request.message === "API_key_invalid") {
        document.getElementById("apikey").value = "The API KEY is invalid. Try again!";
        document.getElementById("apikey").style.color = "#e74c3c"; //red color
        setTimeout(() => {
            document.getElementById("apikey").value = "";
            document.getElementById("apikey").style.color = "#495057";
        }, 3000);
    }
});



// if the API key is present in memory, hide the button to save it
function checkAPIKeyatBeginning() {
    chrome.storage.sync.get('APIKEY', function (items) {
        // Check that the API key exists
        if (typeof items.APIKEY !== 'undefined') {
            hideSaveKey();
        }
        else {
            //hide show key button
            document.getElementById('showKey').style.display = 'none';
        }
    }
    );
}


// Update the values of temperature and max token

// To get the value of the temperature and pass it to element with id temp
function Temp() {
    document.getElementById("temp").value = document.getElementById("temperature").value;
}

// add listener when the input is changed and activate the function Temp()
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('temperature').addEventListener('mousemove', Temp, false)
}, false)

function Token() {
    document.getElementById("token").value = document.getElementById("maxtoken").value;
}

// add listener when the input is changed and activate the function Token()
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('maxtoken').addEventListener('mousemove', Token, false)
}, false)


// DRAGGABLE LIST OF PROMPTS in popup.html

var btn = document.querySelector('.add');
var remove = document.querySelector('.draggable');

function dragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    console.log("Inner html", this.innerHTML)
    e.dataTransfer.setData('text/html', this.innerHTML);
    // can one transfer also the id of the element? Answer: yes

};

function dragEnter(e) {
    this.classList.add('over');
}

function dragLeave(e) {
    e.stopPropagation();
    this.classList.remove('over');
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function dragDrop(e) {
    if (dragSrcEl != this) {
        console.log('dragSrcEl', dragSrcEl)
        dragSrcEl.innerHTML = this.innerHTML;
        const id_source = dragSrcEl.id;
        dragSrcEl.id = this.id;
        this.innerHTML = e.dataTransfer.getData('text/html');
        this.id = id_source;
        // get the button delete of the source and the target
    }
    return false;
}

function dragEnd(e) {
    var listItens = document.querySelectorAll('.draggable');
    [].forEach.call(listItens, function (item) {
        item.classList.remove('over');
    });
    this.style.opacity = '1';
    // save the new order of the list
    //   newOrderFromID();
    reoderListinMemory();
}



function newOrderFromID() {
    var listItens = document.querySelectorAll('.draggable');
    var list = [];
    [].forEach.call(listItens, function (item) {
        list.push(item.id);
    });
    console.log('list', list)
    return list;
}

function reoderListinMemory() {
    // get the list of prompts from memory
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the API key exists
        if (typeof items.customprompt !== 'undefined') {
            // alert(items.customprompt);
            var list = items.customprompt;
            // get the new order of the list
            var newOrder = newOrderFromID();
            // reoder the list
            var newList = [];
            for (var i = 0; i < newOrder.length; i++) {
                newList.push(list[newOrder[i]]);
            }
            // save the new list in memory
            chrome.storage.sync.set({ 'customprompt': newList }, function () {
                items.customprompt = newList;
                makePromptList(items);

            });
        }
        chrome.runtime.sendMessage({ text: "new_prompt_list" });
    }
    );
}

function addEventsDragAndDrop(el) {
    el.addEventListener('dragstart', dragStart, false);
    el.addEventListener('dragenter', dragEnter, false);
    el.addEventListener('dragover', dragOver, false);
    el.addEventListener('dragleave', dragLeave, false);
    el.addEventListener('drop', dragDrop, false);
    el.addEventListener('dragend', dragEnd, false);
}
