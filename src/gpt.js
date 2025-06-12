import GPT3Tokenizer from "gpt3-tokenizer";
import OpenAI from "openai";

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
export const CHAT_API_MODELS = {
  "gpt-4": true,
  "gpt-3.5-turbo": true,
  "gpt-4-turbo": true,
  "gpt-4o": true,
  "gpt-4o-mini": true,
};

export const VISION_SUPPORTED_MODELS = {
  "gpt-4-turbo": true,
  "gpt-4o": true,
  "gpt-4o-mini": true,
}


function checkMaxTokens(content, model) {
  var tokens = 0;
  if (model in CHAT_API_MODELS) {
    // check the tokens in the text, for each "content" key
    // console.log("Original content:", content);
    if (content[0].role === "user"){
      // Request came from prompt-on-the-fly
      if (content[0].content.length > 0 && content[0].content[0].type) {
        content = [content[0].content[0].text];
        // console.log("Cropping content", content);
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
    }

    // Content should be a list of strings
    for (var i = 0; i < content.length; i++) {
      tokens += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
      var singleMsgToken = countTokens(content[i]);
      tokens += singleMsgToken;
      tokens += 2; // every reply is primed with <im_start>assistant
    }
  } else {
    tokens = countTokens(content, model);
  }
  const maxTokens = 4096 // True for most models
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
  if (typeof string === "object") {
    string = string[string.length - 1]["content"];
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
  let text = prompt["prompt"];
  const model = prompt["model"];
  // if the model is gpt-4 or gpt-3.5-turbo, we need to check that the text is a valid json
  if (model in CHAT_API_MODELS) {
    if (typeof text !== "object") {
      text = [{ role: "user", content: text }];
    }
  } else {
    //we check that text is a string, if is JSON just take the last element value corresponding to the key "content"
    if (typeof text === "object") {
      text = text[text.length - 1]["content"];
    }
  }

  const temperature = prompt["temperature"];
  const popupID = prompt["popupID"]; // may be undefined
  const uuid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const { params, str_bodyData, tokens } = chooseCompletion(model, temperature, text);
  const openai = new OpenAI({
    apiKey: items.APIKEY,
    dangerouslyAllowBrowser: true,
  });

  checkTabsAndSendStream("GPTprompt", tabs, text, params, popupID, uuid, tokens);

  let stream;
  if (model in CHAT_API_MODELS) {
    stream = await openai.chat.completions.create(params);
  } else {
    stream = await openai.completions.create(params);
  }

  for await (const chunk of stream) {
    const delta =
      (chunk.choices && chunk.choices[0] &&
        (chunk.choices[0].delta?.content || chunk.choices[0].text)) || "";
    if (delta) {
      checkTabsAndSendStream(
        "GPTStream_completion",
        tabs,
        delta,
        str_bodyData,
        popupID,
        uuid,
        null
      );
    }
  }
}

export default promptGPT3Prompting;

function chooseCompletion(model, temperature, text) {
  const { maxTokens, tokens } = checkMaxTokens(text, model);
  let params;

  if (model in CHAT_API_MODELS) {
    params = {
      model,
      temperature,
      max_tokens: maxTokens,
      messages: text,
      stream: true,
    };
  } else {
    params = {
      model,
      temperature,
      max_tokens: maxTokens,
      prompt: text,
      stream: true,
    };
  }

  const str_bodyData = JSON.stringify(params);
  return { params, str_bodyData, tokens };
}
