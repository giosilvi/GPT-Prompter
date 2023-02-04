function checkTabsAndSendStream(message, tabs, string, bodyData, idpopup, uuid) {
    if (tabs.id == -1) { //pdf case
      // console.log("pdf case");
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          sendStream(message, tabs[0].id, string, bodyData, idpopup, uuid);
        });
      }
      else {// html case
        // console.log("html case");
        sendStream(message, tabs.id, string, bodyData, idpopup, uuid);
      }
    }
    
function sendStream(message, id, string, bodyData, idpopup, uuid) {
      chrome.tabs.sendMessage(id, {
        message: message,
        text: string,
        bodyData: bodyData,
        id_popup: idpopup,
        uuid : uuid
      }); //send the completion to the content script
    }

async function promptGPT3Prompting(prompt, items, tabs) {
  var text = prompt["prompt"]
  var model = prompt["model"]
  var temperature = prompt["temperature"]
  var max_tokens = prompt["max_tokens"]
  var popupID = prompt["popupID"] // may be undefined
  var uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  //send immediately text to the content script
  console.log(text, model, temperature, max_tokens);
  const url = "https://api.openai.com/v1/completions";
  var bodyData = {
    "model": model,
    "temperature": temperature,
    "max_tokens": max_tokens,
    "prompt": text,
    "stream": true,
    "logprobs": 1
  };
  // remove stream from bodyData
  var str_bodyData = JSON.stringify(bodyData);

  fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + items.APIKEY
    },
    body: str_bodyData
  }
  ).then((response) => response.body)
    .then((body) => {
      checkTabsAndSendStream("GPTprompt", tabs, text, bodyData, popupID,uuid); // send the prompt to the content script, to be added to last mini popup
      const reader = body.getReader();
      return pump();

      function pump() {
        return reader.read().then(({ done, value }) => {
          // When no more data needs to be consumed, close the stream
          if (done) {return;}
          // Enqueue the next data chunk into our target stream
          // console.log(value);
          var stream = new TextDecoder().decode(value);//.substring(6);
          // console.log(string, typeof string);
          // if tabs.id == -1 then use querySelector to get the tab
          checkTabsAndSendStream("GPTStream_completion", tabs, stream, str_bodyData, popupID, uuid);
          return pump();
        });
      }
    }
    ).catch(err => {
      console.log("error" + err);
      checkTabsAndSendStream("GPTStream_completion", tabs, "Error:" + err, str_bodyData, popupID, uuid);
    });
}

export default promptGPT3Prompting;