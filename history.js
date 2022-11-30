function makeHistoryList(items) {
    var freshList = '';
    var totalCost = 0;
    for (var i = items.history.length - 1; i >= 0; i--) {
        console.log(items.history[i][0]);
        freshList += '<li class="list-group-item list-group-item-action" style="white-space: pre-wrap;">'
        var prompt = JSON.parse(items.history[i][0]);
        console.log(prompt, typeof prompt, typeof items.history[i][0]);
        // print keys of the prompt
        for (var key in prompt) {
            // if key is not stream
            if (key != 'stream') {
                var value = prompt[key];
                freshList += key + ': ' + value + '<br>';
            }
        }
        // var cleanAns = items.history[i][1].replace(prompt["prompt"], '');
        freshList += 'completion:' + items.history[i][1] + '<br>'
        freshList += 'cost: ' + items.history[i][2] + '$  <button  class="save" id="eraseItem' + i.toString() + '" > Delete </button></li>';
        totalCost += parseFloat(items.history[i][2]);
    }
    document.getElementById('totCost').innerHTML = 'Total cost: ' + totalCost.toFixed(2) + '$';
    return freshList;
}
// in javascript, to return two values, use an array


function update_del_buttons(items) {
    for (var j = 0; j < items.history.length; j++) {
        document.getElementById('eraseItem' + j.toString()).addEventListener('click', function () {
            var id = this.id.substring(9);
            erasePrompt(id);
        }
            , false)
    }
}

function erasePrompt(index) {
    // try to retrive the custom prompt from the storage API
    console.log('erasePrompt: ' + index);
    chrome.storage.local.get('history', function (items) {
        // Check that the history prompt exists
        if (typeof items.history !== 'undefined') {
            // check that the index is valid
            if (index <= items.history.length) {
                // remove the prompt from the array
                items.history.splice(index, 1);
                freshList = makeHistoryList(items);
                document.getElementById('history-of-prompts').innerHTML = freshList
                update_del_buttons(items);;
                chrome.storage.local.set({ 'history': items.history }, function () {
                    // Notify that is erased
                    console.log('Your prompt was erased from history.');
                })
            }
        }
    });
}


// On DOMloaded event make a fresh list of custom prompts
function load_history() {
    //retrieve from chrome storage the custom prompt
    chrome.storage.local.get('history', function (items) {
        //check if it exists
        if (typeof items.history !== 'undefined') {
            // check if it is not empty
            if (items.history.length > 0) {
                freshList = makeHistoryList(items);
                document.getElementById('history-of-prompts').innerHTML = freshList
                update_del_buttons(items);
            }
        }
    }
    )
}

function delete_all() {
    chrome.storage.local.get('history', function (items) {
        if (typeof items.history !== 'undefined') {
            items.history = [];
            document.getElementById('history-of-prompts').innerHTML = "History deleted";
            document.getElementById('totCost').innerHTML = "";
            update_del_buttons(items);
            chrome.storage.local.set({ 'history': items.history }, function () {
                // Notify that is erased
                console.log('Your history was erased.');
            })
        }
    }
    )

}
// add a function called "filter" to filter the history list based on value in <input> with id="promptsearch"
function filter() {
    var input, filter, ul, li, a, i;
    input = document.getElementById('promptsearch');
    filter = input.value.toUpperCase();
    ul = document.getElementById('history-of-prompts');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
        a = li[i];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }

}

//create a function to export the history list shown to a json file
function export_history() {
    ul = document.getElementById('history-of-prompts');
    li = ul.getElementsByTagName('li');
    var history_to_save = [];
    for (var i = 0; i < li.length; i++) {
        // if li element is not hidden
        if (li[i].style.display != 'none') {
            // from li[i].innerHTML get the prompt, completion , and remove any <br> element
            var prompt = li[i].innerHTML.split('prompt:')[1].split('completion:')[0].replace(/<br>/g, '');
            var completion = li[i].innerHTML.split('completion:')[1].split('Cost:')[0].replace(/<br>/g, '');
            // combine the prompt and completion to dictionary
            var prompt_completion = { 'prompt': prompt, 'completion': completion };
            // add the dictionary to the history_to_save array
            history_to_save.push(prompt_completion);
        }

    }
    // if the history_to_save array is not empty
    if (history_to_save.length > 0) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history_to_save));
        var search_term = document.getElementById('promptsearch').value;
        let exportFileDefaultName = 'PrompterHistory_'+search_term+'.json';

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataStr);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}




// execute the load function when the page is loaded
document.addEventListener('DOMContentLoaded', load_history, false);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('delete-all').addEventListener('click', function () {
        delete_all();
    });
     // add event listener to promptsearch for event keydown, and nest into it a listener for keyup
    document.getElementById('promptsearch').addEventListener('keyup', filter, false);
    // add event listener to export button
    document.getElementById('export_to_json').addEventListener('click', export_history, false);
});


