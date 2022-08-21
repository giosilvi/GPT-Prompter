//make a constat called DaVinci cost
// const DaVinciCost = 0.06 / 1000;

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

function sendStream(message, id, string, body_data) {
  console.log("sendStream");
  console.log(body_data);
  chrome.tabs.sendMessage(id, { message: message,
                                text: string,
                                body_data: body_data }); //send the answer to the content script
}

function checkTabsAndSendStream(message,tabs,string,body_data) {
  if (tabs.id == -1) { //pdf case
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendStream(message,tabs[0].id, string, body_data);
    });
  }
  else {// html case
    sendStream(message,tabs.id, string, body_data);
  }
}


async function promptGPT3Prompting(prompt, items, tabs) {
  var text = prompt["prompt"]
  var model = prompt["model"]
  var temperature = prompt["temperature"]
  var max_tokens = prompt["max_tokens"]
  //send immediately text to the content script
  console.log(text,model,temperature,max_tokens);
  console.log('Tabs', tabs);
  const url = "https://api.openai.com/v1/completions";
  var body_data = { "model": model, "temperature": temperature, "max_tokens": max_tokens, "prompt": text, "stream": true };
  var str_body_data = JSON.stringify(body_data);
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + items.APIKEY
    },
    body: str_body_data
  }
  ).then((response) => response.body)
    .then((body) => {
      checkTabsAndSendStream("GPTprompt", tabs, text, body_data); // send the prompt to the content script, to be added to last mini popup
      const reader = body.getReader();
      return pump();

      function pump() {
        return reader.read().then(({ done, value }) => {
          // When no more data needs to be consumed, close the stream
          if (done) {
            console.log("reader:done");
            return;
          }
          // Enqueue the next data chunk into our target stream
          // console.log(value);
          var stream = new TextDecoder().decode(value);//.substring(6);
          // console.log(string, typeof string);
          // if tabs.id == -1 then use querySelector to get the tab
          checkTabsAndSendStream("GPTStream_answer", tabs, stream, str_body_data);
          return pump();
        });
      }
    }
    ).catch(err => {
      console.log("error" + err);
      checkTabsAndSendStream("GPTStream_answer", tabs, "Error:" + err, str_body_data);

    });
}

export default promptGPT3Prompting;