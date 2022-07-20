function makePromptList (items) {
    var freshList = '';
        for (var i = 0; i < items.customprompt.length; i++) {
            console.log(items.customprompt[i]);
            freshList += '<li>' + items.customprompt[i] + '<button id="del' + i.toString() + '" > Delete </button></li>'; //onclick="erasePrompt('+i.toString()+'"
        }
        return freshList;
}




//add function to save the the custom prompt in storage
function savePrompt() {
    // get the text from the prompt

    var text = document.getElementById("promptinput").value;

    // try to retrive the custom prompt from the storage API
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        // alert('Here'+text)
        if (typeof items.customprompt !== 'undefined') {
            // if the prompt is not present in the list items.customprompt, push to it
            if (!items.customprompt.includes(text)) {
                items.customprompt.push(text);
            }

        } else {
            // if the prompt does not exist, create a new array with the prompt
            items.customprompt = [text];
        };

        freshList = makePromptList(items);
        document.getElementById('list-of-prompts').innerHTML = freshList

        // save the new array in the storage API
        chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
            // Notify that we saved
            console.log('Your custom prompt was saved.');
        })
        chrome.runtime.sendMessage({text: "new prompt list"});
    });
}

//add a function to erase a custom prompt from the storage API provided the index of the prompt
function erasePrompt(index) {
    // try to retrive the custom prompt from the storage API
    chrome.storage.sync.get('customprompt', function (items) {
        // Check that the prompt exists
        if (typeof items.customprompt !== 'undefined') {
            // check that the index is valid
            if (index < items.customprompt.length) {
                // remove the prompt from the array
                items.customprompt.splice(index, 1);
                // save the new array in the storage API
                chrome.storage.sync.set({ 'customprompt': items.customprompt }, function () {
                    // Notify that we saved
                    console.log('Your custom prompt was erased.');
                })
                
                chrome.runtime.sendMessage({text: "new prompt list"});
            }
            
        }
    }
    
    );
    // chrome.storage.sync.get('customprompt', function (items) {
    //     freshList = makePromptList(items);
    //     document.getElementById('list-of-prompts').innerHTML = freshList
    // });
}



function saveKey() {
    // Get a value saved in an input
    var apiKey = document.getElementById('apikey').value;
    // Check that the key has been entered
    if (!apiKey) {
        console.log('Error: No value specified');
        return;
    }
    // Save it using the Chrome extension storage API
    chrome.storage.sync.set({ 'APIKEY': apiKey }, function () {
        // Notify that we saved
        console.log('Your API key was saved.');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'Saved')
        })
    });
    chrome.action.setIcon({ path: "icons/iconA16.png" })
}

// retrieve the API key from the storage API and
function retrieveKey() {
    chrome.storage.sync.get('APIKEY', function (items) {
        // Check that the key exists
        
        if (typeof items.APIKEY !== 'undefined') {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'APIKEY: ' + items.APIKEY)
            })

        } else {
            // Send message no key found
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'APIKEY: Not found')
            })

        }
    });
}


//make a function that listen for event keydown on the input
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('promptinput').addEventListener('keyup', onkey, false);
    function onkey(e) {
        //get the value of the input
        var inputtext = document.getElementById('promptinput').value;
        //check if "##SELECTED TEXT##" doesn`t contained in inputtext
        if (inputtext.indexOf("##SELECTED TEXT##") == -1) {
            //if not, reset the input
            //check if "##SELECTED TEXT#" is contained in inputtext
            if (inputtext.indexOf("##SELECTED TEXT#") != -1) {
                //if yes, replace it with "##SELECTED TEXT##"
                inputtext = inputtext.replace("##SELECTED TEXT#", "##SELECTED TEXT##");
                // update the input
                document.getElementById('promptinput').value = inputtext;
            }
            //check if "#SELECTED TEXT##" is contained in inputtext
            else if (inputtext.indexOf("#SELECTED TEXT##") != -1) {
                //if yes, replace it with "##SELECTED TEXT##"
                inputtext = inputtext.replace("#SELECTED TEXT##", "##SELECTED TEXT##");
                // update the input
                document.getElementById('promptinput').value = inputtext;
            }
            else {
                document.getElementById('promptinput').value = "##SELECTED TEXT##";
            }

        }

    }
}
);



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveKey').addEventListener('click', onclick, false)
    function onclick() {
        //call saveKey() function
        saveKey();
        //get the text in

    }

}, false)

// add the event listener to the button CreatePrompt
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createPrompt').addEventListener('click', onclick, false)
    function onclick() {
        savePrompt();
    }
}
    , false)


// add the event listener to the button show api key
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('showKey').addEventListener('click', onclick, false)
    function onclick() {
        retrieveKey()
    }
}
    , false)

document.addEventListener('DOMContentLoaded', function () {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({ active: true, url: location });
            };
        })();
    }
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
            for (var j = 0; j < items.customprompt.length; j++) {
                document.getElementById('del' + j.toString()).addEventListener('click', function () {
                    var id = this.id.substring(3);
                    erasePrompt(id);
                }
                    , false)

            }
            j = 0;
        }
    }
    )
}
    , false);
