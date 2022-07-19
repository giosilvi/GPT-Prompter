async function promptGPT3Explanation(inputtext, id) {
    var prompt =  "Tell me more about '" + inputtext + "':\n";
    chrome.storage.sync.get('APIKEY', function (items) {
        if (typeof items.APIKEY !== 'undefined') {
            var url = "https://api.openai.com/v1/completions";
            // fetch has 2 arguments:
            // - the url
            // - the headers
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + items.APIKEY
                },
                body: JSON.stringify({ "model": "text-davinci-002", "prompt":prompt, "temperature": 0, "max_tokens": 50 })
            }).then(result => result.json())
                .then((result) => {
                    chrome.tabs.sendMessage(id, result.choices[0].text,
                        (rsp) => {
                            console.log("content script replies:");
                            console.log(rsp);
                        });
                }).catch(err => {
                    console.log("error, login failed");
                    loadIcon().then(console.log("loaded icon"));

                });
        }
        else {
            chrome.tabs.sendMessage(id, 'APIKEY not found' );
            console.log('No API key found.');
        }
    })
}
// to send a message to the content script, we use the sendMessage() function.
// The content script is the script that is injected into the page.
// inside an async function, we can use await to wait for a promise to be resolved.
// The promise is the result of the function call.
// The promise is resolved when the function call is complete.

//export default promptGPT3Explanation below using the ES6 syntax:
export default promptGPT3Explanation;

