export const models = {
  "gpt-4-turbo": "🚀",
  "gpt-4": "❹",
  "gpt-3.5-turbo": "🅶",
  "gpt-4o": "🅾"
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