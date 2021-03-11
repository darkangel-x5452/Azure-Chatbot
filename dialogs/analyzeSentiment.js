// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Demonstrates how to analyze sentiment in documents.
 * An overall and per-sentence sentiment is returned.
 */

const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

// Load the .env file if it exists
const dotenv = require("dotenv");
dotenv.config();
module.exports = async function sentimentService(messageText) {

    // You will need to set these environment variables or edit the following values
    const endpoint = process.env["AZURE_TEXT_ANALYTICS_ENDPOINT"] // || "<cognitive services endpoint>";
    const apiKey = process.env["AZURE_TEXT_ANALYTICS_KEY"] // || "<api key>";
    var positiveScore;
    var neutralScore = "";
    var negativeScore = "";
    var sentimentVal = "";
    var sentimentResult = [];
    const documents = [
      messageText
    ];

    console.log("=== Analyze Sentiment Sample ===");

    const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));

    const results = await client.analyzeSentiment(documents);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`- Document ${result.id}`);
      if (!result.error) {
        positiveScore = result.confidenceScores.positive;
        neutralScore = result.confidenceScores.neutral;
        negativeScore =result.confidenceScores.negative;
        sentimentVal = result.sentiment;
        sentimentResult = [sentimentVal, positiveScore, neutralScore, negativeScore];
      } else {
        console.error(`\tError: ${result.error}`);
      }
    }
    return sentimentResult;
}
