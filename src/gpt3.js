import GPT3Tokenizer from "gpt3-tokenizer";

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
export const CHAT_API_MODELS = {
  "gpt-4": true,
  "gpt-3.5-turbo": true,
  "gpt-4-turbo": true,
  "gpt-4o": true
};

export const VISION_SUPPORTED_MODELS = {
  "gpt-4-turbo": true,
  "gpt-4o": true
}

// For models that have a maximum token limit (input + output tokens per request).
var MaxTokensPerModel = {
  "gpt-4": 8000,
  "gpt-3.5-turbo": 4000,
  "gpt-3.5-turbo-instruct": 4000,
  "text-davinci-003": 4000,
  "text-davinci-002": 4000,
  "text-curie-001": 2000,
  "text-babbage-001": 2000,
  "text-ada-001": 2000
};

// Note: This is the number of maximum output tokens (not the context window size).
const MaxOutputTokensPerModel = {
  "gpt-4o": 4000,
  "gpt-4-turbo": 4096
}

const MaxInputTokensPerModel = {
  "gpt-4o": 4000,
  "gpt-4-turbo": 4096

}

const DECOUPLED_INPUT_OUTPUT_LENGTH_MODELS = {
  "gpt-4-turbo": true,
  "gpt-4o": true
};

function checkMaxTokens(content, model) {
  var tokens = 0;
  if (model in CHAT_API_MODELS) {
    // check the tokens in the text, for each "content" key
    console.log("Original content:", content);
    if (content[0].role === "user"){
      // Request came from prompt-on-the-fly
      if (content[0].content.length > 0 && content[0].content[0].type) {
        content = [content[0].content[0].text];
        console.log("Cropping content", content);
      }
      else{
        content = [content[0].content];
      }
    }
    else{
      // Request came from ChatGPT interface
      let tmp = [];
      for (var i = 0; i < content.length; i++) {
        if (content[i].content.length > 0 && content[i].content[0].type) tmp.push(content[i].content[0].text);
        else tmp.push(content[i].content);
      }
      content = tmp;
      console.log("Cropping content", content);
    }

    // Content should be a list of strings
    for (var i = 0; i < content.length; i++) {
      tokens += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
      var singleMsgToken = countTokens(content[i]);
      tokens += singleMsgToken;
      console.log(singleMsgToken, content[i]);
      tokens += 2; // every reply is primed with <im_start>assistant
    }
  } else {
    tokens = countTokens(content, model);
  }
  var maxTokens = MaxTokensPerModel[model] - tokens;
  if (model in DECOUPLED_INPUT_OUTPUT_LENGTH_MODELS) {
    maxTokens = MaxTokensPerModel[model];
  }
  console.log("model", model, "maxTokens", maxTokens, "tokens", tokens);
  return { maxTokens, tokens };
}

function countTokens(text, model) {
  if (!text) {
    return 0;
  }
  const encoded = tokenizer.encode(text);
  return encoded.bpe.length;
}


function checkTabsAndSendStream(message, tabs, string, bodyData, idpopup, uuid, tokens_sent) {
  if (typeof text === "object") {
    text = text[text.length - 1]["content"];
  }
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
  let messageObj = {
    message: message,
    text: string,
    bodyData: bodyData,
    id_popup: idpopup,
    uuid: uuid,
    tokens_sent: tokens_sent,
  };
  chrome.tabs.sendMessage(id, messageObj); //send the completion to the content script
}

async function promptGPT3Prompting(prompt, items, tabs) {
  var text = prompt["prompt"];
  var model = prompt["model"];
  // if the model is gpt-4 or gpt-3.5-turbo, we need to check that the text is a valid json
  if (model in CHAT_API_MODELS) {
    console.log('Check', typeof text)
    if (typeof text !== "object") { text = [{ "role": "user", "content": text }]; }
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
  console.log("Before choosing completion");
  console.log("Debug0", model, temperature, text)
  var { url, str_bodyData, bodyData, tokens } = chooseCompletion(model, temperature, text);
  console.log("Debug1", url, str_bodyData, tokens);

  let keepStreaming = true;

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
        //   console.log(value);
          var stream = new TextDecoder().decode(value); //.substring(6);
          // console.log(string, typeof string);
          // if tabs.id == -1 then use querySelector to get the tab
          checkTabsAndSendStream("GPTStream_completion", tabs, stream, str_bodyData, popupID, uuid, null);
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
  console.log("Choosing completions! (Final Step)");
  console.log(text, model);
  var { maxTokens, tokens } = checkMaxTokens(text, model);
  var url = "";

  if (model in CHAT_API_MODELS) {
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
    };
  }
  var str_bodyData = JSON.stringify(bodyData);
  return { url, str_bodyData, bodyData, tokens };
}
