// GENERAL FUNCTIONS
function makePromptList(items) {
    var freshList = '';
    for (var i = 0; i < items.customprompt.length; i++) {
        freshList += '<li class="list-group-item">' + items.customprompt[i]['prompt'] + "<br> (Model: " + items.customprompt[i]['model'] + " ,Temp: " + items.customprompt[i]['temperature'] + " , Max length:" + items.customprompt[i]['max_tokens'] + ') <button id="del' + i.toString() + '" class="save" > Delete </button></li>';
    }
    return freshList;
}

function update_del_buttons(items) {
    for (var j = 0; j < items.customprompt.length; j++) {
        document.getElementById('del' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(3);
            erasePrompt(id);
        }
            , false)
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
    // get the text from the prompt
    var model = document.getElementById("inputmodel").value;
    var temp = parseFloat(document.getElementById("temp").value);
    var token = parseInt(document.getElementById("token").value);
    var text = document.getElementById("promptinput").value;
    console.log('Temp: ' + temp);
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

            if (prompt_already_present == false) {
                items.customprompt.push(body_data);
                document.getElementById('list-of-prompts').innerHTML = makePromptList(items) //update the list of prompts
                update_del_buttons(items); // update right click menu
                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that we saved
                    console.log('Your custom prompt was saved.');
                })
                chrome.runtime.sendMessage({ text: "new_prompt_list" });
            }
        } else {
            // if the prompt does not exist, create a new array with the prompt
            items.customprompt = [text];
        };
    });
}

//add a function to erase a custom prompt from the storage API provided the index of the prompt
function erasePrompt(index) {
    // try to retrive the custom prompt from the storage API
    console.log('erasePrompt: ' + index);
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        console.log('Erasing.');
        if (typeof items.customprompt !== 'undefined') {
            // check that the index is valid
            if (index <= items.customprompt.length) {
                // remove the prompt from the array
                items.customprompt.splice(index, 1);
                document.getElementById('list-of-prompts').innerHTML = makePromptList(items); //update the list of prompts
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


// add the event listener to the button CreatePrompt
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createPrompt').addEventListener('click', onclick, false)
    function onclick() {
        savePrompt();
        // store value of document.getElementById("promptinput").value
        var customprompt = document.getElementById('promptinput').value;

        document.getElementById('promptinput').value = 'Prompt created! Available in right-click menu.';
        document.getElementById("promptinput").style.color = "#10a37f"; //green color for the prompt created
        setTimeout(function () {
            document.getElementById('promptinput').value = customprompt
            document.getElementById("promptinput").style.color = "#495057"  //exadecimal standard color
        }, 2000);

    }
}
    , false)


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
            freshList = makePromptList(items);
            document.getElementById('list-of-prompts').innerHTML = freshList
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
    var t = document.getElementById("temperature").value;
    document.getElementById("temp").value = t;
}

// add listener when the input is changed and activate the function Temp()
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('temperature').addEventListener('mousemove', Temp, false)
}, false)

function Token() {
    var k = document.getElementById("maxtoken").value;
    document.getElementById("token").value = k;
}

// add listener when the input is changed and activate the function Token()
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('maxtoken').addEventListener('mousemove', Token, false)
}, false)