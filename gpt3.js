//make a constat called DaVinci cost
const DaVinciCost = 0.06 / 1000;

async function promptGPT3Explanation(prompt,items, tabs) {
    // var prompt =  "Tell me more about '" + info.selectionText + "':\n";
    console.log(prompt);
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
            
            try{
            chrome.tabs.sendMessage(tabs.id, { message: 'GPTanswer', text: result.choices[0].text }); //send the answer to the content script
            }
            catch (err){
                console.log(err);
                console.log(result.choices[0].text)
                var opt = {
                    iconUrl: "icons/iconA16.png",
                    type: 'basic',
                    title: 'GPT answer',
                    message: result.choices[0].text,
                    priority: 1,
                    };
                
                chrome.notifications.create('notify1', opt);
            }
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
                // console.log(items.history);
            }
            );
        }).catch(err => {
            console.log("error" + err);
        });
}




export default promptGPT3Explanation;
// export default {promptGPT3Explanation, checkGPT};
// to export more

