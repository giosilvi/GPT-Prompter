
const models = {
  "gpt-4-0125-preview": "🚀",
  "gpt-4": "❹",
  "gpt-3.5-turbo": "🅶",
  "text-davinci-003": "ↁ",
  "text-davinci-002": "🅳",
  "text-curie-001": "🅲",
  "text-babbage-001": "🅑",
  "text-ada-001": "🅐"
};
  //the above function symbolFromModel can be rewritten as a dictionary
  function symbolFromModel(model) {
    // check if the model is in the dictionary
    if (models.hasOwnProperty(model)) {
      return models[model];
    }
    return "";
  }

  export default symbolFromModel;