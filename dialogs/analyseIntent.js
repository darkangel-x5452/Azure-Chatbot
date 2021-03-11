//
// This quickstart shows how to predict the intent of an utterance by using the LUIS REST APIs.
//
const dotenv = require("dotenv");
dotenv.config();

var requestPromise = require('request-promise');
var queryString = require('querystring');

// Analyze a string utterance.
module.exports = async function getPrediction(messageText) {

    //////////
    // Values to modify.

    // YOUR-APP-ID: The App ID GUID found on the www.luis.ai Application Settings page.
    const LUIS_appId = process.env["LUIS_appId"];

    // YOUR-PREDICTION-KEY: Your LUIS authoring key, 32 character value.
    const LUIS_predictionKey = process.env["LUIS_predictionKey"];

    // YOUR-PREDICTION-ENDPOINT: Replace this with your authoring key endpoint.
    // For example, "https://westus.api.cognitive.microsoft.com/"
    const LUIS_endpoint = process.env["LUIS_endpoint"];

    // The utterance you want to use.
    // const testMessage = messageText;
    const utterance = messageText;
    //////////

    // Create query string
    const queryParams = {
        "show-all-intents": true,
        "verbose":  true,
        "query": utterance,
        "subscription-key": LUIS_predictionKey
    }

    // Create the URI for the REST call.
    const URI = `${LUIS_endpoint}luis/prediction/v3.0/apps/${LUIS_appId}/slots/production/predict?${queryString.stringify(queryParams)}`

    const response = await requestPromise(URI)

    response_array = JSON.parse(response)//.intents//.$intent_key.score;
    const intent_key = Object.keys(response_array.prediction.intents)[0];
    const intent_score = Object.values(response_array.prediction.intents)[0].score;
    const luis_sentiment = response_array.prediction.sentiment.label;
    const result = [intent_key, intent_score, luis_sentiment]
    return result
}
