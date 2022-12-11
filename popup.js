// GENERAL FUNCTIONS
// function makePromptList(items) {
//     var freshList = '';
//     for (var i = 0; i < items.customprompt.length; i++) {
//         freshList += '<li class="list-group-item draggable" draggable="true">' + items.customprompt[i]['prompt'] + "<br> (Model: " + items.customprompt[i]['model'] + " ,Temp: " + items.customprompt[i]['temperature'] + " , Max length:" + items.customprompt[i]['max_tokens'] + ') <button id="del' + i.toString() + '" class="save" > Delete </button></li>';
//     }
//     return freshList;
// }

function makePromptList(items) {
    // clear the node 'list-of-prompts'
    var ul = document.getElementById('list-of-prompts');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    for (var i = 0; i < items.customprompt.length; i++) {
        var li = document.createElement('li');
        var attr = document.createAttribute('draggable');
        var id = document.createAttribute('id');
        id.value = i;
        li.setAttributeNode(id);
        li.className = 'list-group-item draggable';
        attr.value = 'true';
        li.setAttributeNode(attr);
        // add to li a button with the id 'del' + i.toString()
        li.innerHTML = items.customprompt[i]['prompt'] + "<br> (Model: " + items.customprompt[i]['model'] + ",Temp: " + items.customprompt[i]['temperature'] + ", Max tokens:" + items.customprompt[i]['max_tokens'] + ')  <button id="edit' + i.toString() + '" class="save" > Edit </button>    <button id="del' + i.toString() + '" class="save" > Delete </button>';
        // li.innerHTML = items.customprompt[i]['prompt'] + "<br> (Model: " + items.customprompt[i]['model'] + ",Temp: " + items.customprompt[i]['temperature'] + ", Max tokens:" + items.customprompt[i]['max_tokens'] + ')   <button id="del' + i.toString() + '" class="save" > Delete </button>';
        ul.appendChild(li);
        addEventsDragAndDrop(li);
    }
}

function update_del_buttons(items) {
    for (var j = 0; j < items.customprompt.length; j++) {
        document.getElementById('del' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(3);
            erasePrompt(id);
        }, false)
        // add event listener to the edit button
        document.getElementById('edit' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(4);
            editPrompt(id);
        }   , false)
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
    }
    else {
        document.getElementById('apikey').style.display = 'none';
        document.getElementById('saveKey').style.display = 'none';
        document.getElementById('deleteKey').style.display = 'none';
        document.getElementById('linktoAPI').style.display = 'none';
        document.getElementById('showKey').innerHTML = 'Show API';
    }


    // document.getElementById('showKey').style.display = 'none';
}


function hideSaveKey() {
    //hide the element with id 'apikey' and the 'saveKey' button
    document.getElementById('apikey').style.display = 'none';
    document.getElementById('saveKey').style.display = 'none';
    document.getElementById('deleteKey').style.display = 'none';
    document.getElementById('linktoAPI').style.display = 'none';
    document.getElementById('showKey').style.display = 'block';
    //show the element with id 'showKey'
    // document.getElementById('showKey').style.display = 'block';
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
                update_del_buttons(items); // update right click menu
                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that we saved
                    console.log('Your custom prompt was saved.');
                })
                chrome.runtime.sendMessage({ text: "new_prompt_list" });
                document.getElementById('promptinput').value = 'Prompt created! Available in right-click menu.';
                document.getElementById("promptinput").style.color = "#10a37f"; //green color for the prompt created
            }
            else {
                console.log('Your custom prompt was already saved.');
                var customprompt = document.getElementById('promptinput').value;

                document.getElementById('promptinput').value = 'Prompt already present! Available in right-click menu.';
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
                update_del_buttons(items);  // update the delete buttons

                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that is erased
                    console.log('Your custom prompt was erased.');
                })
                chrome.runtime.sendMessage({ text: "new_prompt_list" }); // new menu list
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

function editPrompt2(index) {
    //call savePrompt function
    // erasePrompt(index);
    savePrompt();
    // change the innerHTML of the button
    document.getElementById('createPrompt').innerHTML = '<b>Create prompt</b>';
    // change the onclick function of the button
    document.getElementById('createPrompt').onclick = function () { savePrompt() };
}



function saveKey() {
    // Get a value saved in an input
    var apiKey = document.getElementById('apikey').value;
    // Save it using the Chrome extension storage API
    chrome.storage.sync.set({ 'APIKEY': apiKey }, function () {
        // Notify that we saved
        console.log('Your API key was saved.');
    });
}



//make a function that listen for event keydown on the input
document.addEventListener('DOMContentLoaded', function () {
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
            //check if "#SELECTED TEXT##" is contained in inputtext
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
        ;
    }
}, false)



function onclick() {
    //deactivate the button
    
    savePrompt();
    //activate the button
    
    
}

// add the event listener to the button CreatePrompt
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createPrompt').addEventListener('click', onclick, false)
} , false)


// add the event listener to the button show api key
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('showKey').addEventListener('click', onclick, false)
    function onclick() {
        toggleSaveKeyButton();
    }
}
    , false)

//to attach the link to the element "a"
document.addEventListener('DOMContentLoaded', function () {
    var link = document.getElementById('linktoAPI');
    var location = link.href;
    link.onclick = function () {
        chrome.tabs.create({ active: true, url: location });
    };
});




// Load the list of custom prompts from the storage 
document.addEventListener('DOMContentLoaded', function () {
    //retrieve from chrome storage the custom prompt
    chrome.storage.sync.get('customprompt', function (items) {
        //if it exists send an alert
        if (typeof items.customprompt !== 'undefined') {
            // alert(items.customprompt);
            makePromptList(items);
            // document.getElementById('list-of-prompts').innerHTML = freshList
            //add an event listener to the delete buttons
            update_del_buttons(items);
        }
    }
    )
    //check if API is present in storage and if yes, display the API
    chrome.storage.sync.get('APIKEY', function (items) {
        //if it exists send an alert
        if (typeof items.APIKEY !== 'undefined') {
            // alert(items.APIKEY);
            document.getElementById('apikey').value = items.APIKEY;
        }
    })

    checkAPIKeyatBeginning();
}
    , false);



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == "API key is valid") {
        saveKey(); // if the API key is valid, save it
        chrome.action.setIcon({ path: "icons/iconA16.png" })
        // change the value of 'showKey' to 'Successfully saved' for 1 second
        document.getElementById('apikey').value = "API Key is valid!";
        setTimeout(function () {
            hideSaveKey();
        }, 2000);
    }
    else if (request.message == "API key is invalid") {
        // write in inputkey the message 'API key is invalid'
        document.getElementById('apikey').value = "API key is invalid";
        setTimeout(function () {
            document.getElementById('apikey').value = "";
        }, 2000);
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
                update_del_buttons(items);
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
