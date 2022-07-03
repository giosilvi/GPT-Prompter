document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click',  onclick, false)
    function onclick() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'The Answer')
        })
    }
}, false)
