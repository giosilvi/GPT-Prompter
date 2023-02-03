/**
 * Creates an HTML list of items in the 'items.history' array.
 *
 * @param {object} items - The list of items to create the list from.
 * @return {string} - The HTML list.
 */
function makeHistoryList(items) {
    // create empty list and total cost variables
    var list = '';
    var totalCost = 0;
    // loop through items.history array in reverse order
    for (var i = items.history.length - 1; i >= 0; i--) {
        // create list item for current item
        list += createListItem(items.history[i], i);
        // add cost of current item to total cost
        totalCost += parseFloat(items.history[i][2]);
    }
    // update total cost display
    updateTotalCostDisplay(totalCost);
    return list;
}


/**
 * Creates an HTML list item for a single item.
 *
 * @param {object} item - The item to create the list item for.
 * @param {number} index - The index of the item in the list.
 * @return {string} - The HTML list item.
 */
function createListItem(item, index) {
    // create list item element
    var listItem = `<li class="list-group-item list-group-item-action" style="white-space: pre-wrap; transition:  opacity 0.6s;", id="itemHist${index}" >`;
    // parse prompt object from item
    var prompt = JSON.parse(item[0]);
    // create empty prompt content string
    var promptContent = '';
    // add key and value pairs from prompt object to prompt content string
    // if key is 'prompt' put it as last
    for (var key in prompt) {
        if (key !== 'stream' && key !== 'prompt') {
            var value = prompt[key];
            // wrap key in 'strong' element
            promptContent += `<strong>${key}:</strong> ${value}<br>`;
        }
    }
    // add prompt key and value to prompt content string
    promptContent += `<strong>prompt:</strong> ${prompt['prompt']}<br>`;
    // create completion content string
    var completionContent = `<strong>completion:</strong> ${item[1]}<br>`;
    // create cost content string with delete button
    var costContent = `<strong>cost:</strong> ${item[2]}$  <button  class="save" style="float:right;" id="eraseItem${index}" > Delete </button> <br>`;
    // add content strings to list item element
    listItem += `${costContent}${promptContent}${completionContent}`;
    // close list item element
    listItem += '</li>';
    return listItem;
}



/**
 * Updates the total cost display element with the provided total cost.
 *
 * @param {number} totalCost - The total cost to display.
 */
function updateTotalCostDisplay(totalCost) {
    document.getElementById('totCost').innerHTML = `<strong>Total cost:</strong> ${totalCost.toFixed(2)}$`;
}



// in javascript, to return two values, use an array


function update_lower_buttons(items) {
    for (var j = 0; j < items.history.length; j++) {
        document.getElementById('eraseItem' + j.toString()).addEventListener('click', function () {
            // get element itemHist
            
            const id = this.id.substring(9);
            document.getElementById("itemHist"+id).classList.add("hide");
            setTimeout(() => {
                    erasePrompt(id);
            }, 600);
            // 
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
                update_lower_buttons(items);;
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
                update_lower_buttons(items);
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
            update_lower_buttons(items);
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


