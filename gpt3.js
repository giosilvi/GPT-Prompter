async function promptGPT3Explanation(prompt, tabs) {
    // var prompt =  "Tell me more about '" + info.selectionText + "':\n";
    console.log(prompt);
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
                body: JSON.stringify({ "model": "text-davinci-002", "prompt":prompt, "temperature": 0, "max_tokens": 1000 })
            }).then(result => result.json())
                .then((result) => {
                    chrome.tabs.sendMessage(tabs.id, prompt+result.choices[0].text, // send message to tab
                        (rsp) => {
                            console.log("content script replies:");
                            console.log(rsp);
                        });
                }).catch(err => {
                    console.log("error, login failed with API:"+items.APIKEY);
                    // loadIcon().then(console.log("loaded icon"));

                });
        }
        else {
            chrome.tabs.sendMessage(tabs.id, 'APIKEY not found' );
            console.log('No API key found.');
        }
    })
}

export default promptGPT3Explanation;

