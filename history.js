function makeHistoryList (items) {
    var freshList = '';
    for (var i = items.history.length-1; i >= 0 ; i--) {
        //console.log(items.customprompt[i]);
        freshList += '<li class="listhist">' + items.history[i][0]+'<br>' +  items.history[i][1] +'  <button  class="save" id="his' + i.toString() + '" > Delete </button></li>';
    }
    return freshList;
        
}
function update_del_buttons(items){
    for (var j = 0; j < items.history.length; j++) {
        document.getElementById('his' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(3);
            erasePrompt(id);
        }
            , false)

    }
}

function erasePrompt(index) {
    // try to retrive the custom prompt from the storage API
    console.log('erasePrompt: ' + index);
    chrome.storage.local.get('history', function (items) {
        // Check that the prompt exists
        console.log('Erasing.');
        if (typeof items.history !== 'undefined') {
            // check that the index is valid
            if (index <= items.history.length) {
                // remove the prompt from the array
                items.history.splice(index, 1);
                freshList = makeHistoryList(items);
                document.getElementById('history-of-prompts').innerHTML = freshList
                update_del_buttons(items);
                //document.getElementById('list-of-prompts').removeChild(document.getElementById('del' + index.toString()));
                chrome.storage.local.set({ 'history': items.history }, function () {
                    // Notify that is erased
                    console.log('Your history prompt was erased.');
                })
                
            }
            
        }
    });
}


// On DOMloaded event make a fresh list of custom prompts
function load() {
    console.log('I load')
    //retrieve from chrome storage the custom prompt
    chrome.storage.local.get('history', function (items) {
        //if it exists send an alert
        if (typeof items.history !== 'undefined') {
            freshList = makeHistoryList(items);
            document.getElementById('history-of-prompts').innerHTML = freshList
            update_del_buttons(items);
        
        }
    }
    )    
}
load()