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



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveKey').addEventListener('click', onclick, false)
    function onclick() {
        //call saveKey() function
        saveKey();
        //get the text in

    }

}, false)

// add the event listener to the button show api key
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('showKey').addEventListener('click', onclick, false)
    function onclick() {
        //call retrieveKey() function
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
