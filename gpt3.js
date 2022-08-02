//make a constat called DaVinci cost
const DaVinciCost = 0.06 / 1000;

// async function promptGPT3Prompting(prompt,items, tabs) {
//     // var prompt =  "Tell me more about '" + info.selectionText + "':\n";
//     console.log(prompt);
    
//     var url = "https://api.openai.com/v1/completions";
//     var body_data = JSON.stringify({ "model": "text-davinci-002", "temperature": 0, "max_tokens": 1000, "prompt": prompt ,"stream": false});
//     fetch(url, {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json, text/plain, */*',
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + items.APIKEY
//         },
//         body: body_data
//         }
//     ).then((result) => {console.log(result)
//         return result.json()}).then((result) => {
//             var cost = result['usage']['total_tokens'] * DaVinciCost;
//             cost = cost.toFixed(5); //round to 5 decimal places
//             try{
//                 chrome.tabs.sendMessage(tabs.id, { message: 'GPTanswer', text: result.choices[0].text }); //send the answer to the content script
//                 }
//             catch (err){
//                 console.log(err);
//                 console.log(result.choices[0].text)
//                 var opt = {
//                     iconUrl: "icons/iconA48.png",
//                     type: 'basic',
//                     title: 'GPT answer',
//                     message: result.choices[0].text,
//                     priority: 1,
//                     };
//                 chrome.notifications.create('notify1', opt);
//             }
//             // save the result.choices[0].text in the storage 
//             chrome.storage.local.get('history', function (items) {
//                 if (typeof items.history !== 'undefined') {
//                     items.history.push([body_data, result.choices[0].text, cost]);// add the result to the history
//                     chrome.storage.local.set({ 'history': items.history });
//                 }
//                 else {
//                     items.history = [[body_data, result.choices[0].text, cost]]; // initialize the history array
//                     chrome.storage.local.set({ 'history': items.history });
//                 }
//             });
//         }).catch(err => {
//             chrome.tabs.sendMessage(tabs.id, { message: 'GPTanswer', text: "Error:" + err });
//             console.log("error" + err);
//         });
// }


async function promptGPT3Prompting(prompt,items, tabs) {
    // var prompt =  "Tell me more about '" + info.selectionText + "':\n";
    console.log(prompt);
    
    var url = "https://api.openai.com/v1/completions";
    var body_data = JSON.stringify({ "model": "text-davinci-002", "temperature": 0, "max_tokens": 1000, "prompt": prompt ,"stream": true});
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + items.APIKEY
        },
        body: body_data
        }
    ).then((response) =>response.body)
    .then((body) => {
        const reader = body.getReader();
        return new ReadableStream({
            start(controller) {
              return pump();
        
              function pump() {
                return reader.read().then(({ done, value }) => {
                  // When no more data needs to be consumed, close the stream
                  if (done) {
                    controller.close();
                    return;
                  }
        
                  // Enqueue the next data chunk into our target stream
                  console.log(value);
                  var string = new TextDecoder().decode(value);
                  console.log(string, typeof string);
                  chrome.tabs.sendMessage(tabs.id, { message: 'GPTStream_answer', text: string })
                //   convert to JSON or send a message with string

                  controller.enqueue(value);
                  return pump();
                });
              }
            }
          })
        })

}
export default promptGPT3Prompting;