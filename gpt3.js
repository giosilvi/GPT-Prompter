//make a constat called DaVinci cost
const DaVinciCost = 0.06 / 1000;

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
                        body: JSON.stringify({ "model": "text-davinci-002", "prompt": prompt, "temperature": 0, "max_tokens": 1000 })
                        }
                 ).then(result => result.json())
                  .then((result) => {
                        var cost = result['usage']['total_tokens'] * DaVinciCost;
                        cost = '<br> (Cost: ' + cost.toFixed(5) + '$)';
                        chrome.tabs.sendMessage(tabs.id,{message:'GPTanswer', text:result.choices[0].text}); //send the answer to the content script
                        // save the result.choices[0].text in the storage 
                        chrome.storage.local.get('history', function (items) {
                            if (typeof items.history !== 'undefined') {
                                items.history.push([prompt, result.choices[0].text + cost]);
                                chrome.storage.local.set({ 'history': items.history });
                            }
                            else {
                                items.history = [[prompt, result.choices[0].text + cost]];
                                chrome.storage.local.set({ 'history': items.history });
                            }
                            console.log(items.history);
                        }
                        );
                    }).catch(err => {
                    console.log("error"+err);
                    chrome.tabs.sendMessage(tabs.id, "error"+err)
                });
            }
            else {
                chrome.tabs.sendMessage(tabs.id, 'APIKEY not found');
                console.log('No API key found.');
            }
    })
}

async function checkGPT(tabs) {
    chrome.storage.sync.get('APIKEY', function (items) {
        if (typeof items.APIKEY !== 'undefined') {
            var url = "https://api.openai.com/v1/models";
            fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + items.APIKEY
                                },
                        }
                    ).then(result => result.json())
                    .then((result) => {
                        console.log(result);
                        chrome.tabs.sendMessage(tabs.id, result,
                        (rsp) => {
                            console.log("content script replies:");
                            console.log(rsp);
                        });
                    }).catch(err => {
                    console.log("error"+err);
                    chrome.tabs.sendMessage(tabs.id, "error"+err)
                });
            }
            else {
                chrome.tabs.sendMessage(tabs.id, 'APIKEY not found');
                console.log('No API key found.');
            }
    })
}

export default promptGPT3Explanation;
// export default {promptGPT3Explanation, checkGPT};
// to export more

