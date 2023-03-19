import GPT3Tokenizer from "gpt3-tokenizer";

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
const codex_tokenizer = new GPT3Tokenizer({ type: "codex" });

var MaxTokensPerModel = {
  "gpt-4": 8000,
  "gpt-3.5-turbo": 4000,
  "text-davinci-003": 4000,
  "text-davinci-002": 4000,
  "text-curie-001": 2000,
  "text-babbage-001": 2000,
  "text-ada-001": 2000,
  "code-davinci-002": 8000,
};

function checkMaxTokens(content, model) {
  var tokens = 0;
  if (model == "gpt-4" || model == "gpt-3.5-turbo") {
    // check the tokens in the text, for each "content" key
    // var content = JSON.parse(text);
    for (var i = 0; i < content.length; i++) {
      tokens += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
      var singleMsgToken = countTokens(content[i]["content"]);
      tokens += singleMsgToken;
      console.log(singleMsgToken, content[i]["content"]);
      tokens += 2; // every reply is primed with <im_start>assistant
    }
  } else {
    tokens = countTokens(content, model);
  }
  var maxTokens = MaxTokensPerModel[model] - tokens;
  return { maxTokens, tokens };
}

function countTokens(text, model) {
  if (!text) {
    return 0;
  }
  if (model == "code-davinci-002") {
    const encoded = codex_tokenizer.encode(text);
    return encoded.bpe.length;
  } else {
    const encoded = tokenizer.encode(text);
    return encoded.bpe.length;
  }
}


function checkTabsAndSendStream(message, tabs, string, bodyData, idpopup, uuid, tokens_sent) {
  if (tabs.id == -1) {
    //pdf case
    // console.log("pdf case");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendStream(message, tabs[0].id, string, bodyData, idpopup, uuid, tokens_sent);
    });
  } else {
    // html case
    // console.log("html case");
    sendStream(message, tabs.id, string, bodyData, idpopup, uuid, tokens_sent);
  }
}

function sendStream(message, id, string, bodyData, idpopup, uuid, tokens_sent = 0) {
  chrome.tabs.sendMessage(id, {
    message: message,
    text: string,
    bodyData: bodyData,
    id_popup: idpopup,
    uuid: uuid,
    tokens_sent: tokens_sent,
  }); //send the completion to the content script
}

async function promptGPT3Prompting(prompt, items, tabs) {
  var text = prompt["prompt"];
  var model = prompt["model"];
  // if the model is gpt-4 or gpt-3.5-turbo, we need to check that the text is a valid json
  if (model == "gpt-4" || model == "gpt-3.5-turbo") {
    if (typeof text !== "object") 
     {text = [{"role": "user", "content": text}];}
  }
  else {
    //we check that text is a string, if is JSON just take the last elemet value corresponding to the key "content"
    if (typeof text === "object") {
      text = text[text.length - 1]["content"];
    }
  }
  var temperature = prompt["temperature"];
  var popupID = prompt["popupID"]; // may be undefined
  var uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  //send immediately text to the content script
  var { url, str_bodyData, bodyData, tokens } = chooseCompletion(model, temperature, text);
  console.log(url, str_bodyData, tokens);
  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: "Bearer " + items.APIKEY,
    },
    body: str_bodyData,
  })
    .then((response) => response.body)
    .then((body) => {
      checkTabsAndSendStream("GPTprompt", tabs, text, bodyData, popupID, uuid, tokens); // send the prompt to the content script, to be added to last mini popup
      const reader = body.getReader();
      return pump();

      function pump() {
        return reader.read().then(({ done, value }) => {
          // When no more data needs to be consumed, close the stream
          if (done) {
            return;
          }
          // Enqueue the next data chunk into our target stream
          // console.log(value);
          var stream = new TextDecoder().decode(value); //.substring(6);
          // console.log(string, typeof string);
          // if tabs.id == -1 then use querySelector to get the tab
          checkTabsAndSendStream("GPTStream_completion", tabs, stream, str_bodyData, popupID, uuid);
          return pump();
        });
      }
    })
    .catch((err) => {
      console.log("error" + err);
      checkTabsAndSendStream("GPTStream_completion", tabs, "Error:" + err, str_bodyData, popupID, uuid);
    });
}

export default promptGPT3Prompting;

function chooseCompletion(model, temperature, text) {
  var { maxTokens, tokens } = checkMaxTokens(text, model);
  var url = "";

  if (model == "gpt-3.5-turbo" || model === "gpt-4") {
    url = "https://api.openai.com/v1/chat/completions";
    var bodyData = {
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
      messages: text,
      stream: true,
    };
  } else {
    url = "https://api.openai.com/v1/completions";
    var bodyData = {
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
      prompt: text,
      stream: true,
      logprobs: 1,
    };
  }
  var str_bodyData = JSON.stringify(bodyData);
  return { url, str_bodyData, bodyData, tokens };
}
