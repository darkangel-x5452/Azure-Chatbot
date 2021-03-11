// const { ActivityHandler, MemoryStorage } = require('botbuilder');
// const restify = require('restify');
const dotenv = require("dotenv");
const { CosmosDbPartitionedStorage } = require('botbuilder-azure');
var uuid = require('uuid');

dotenv.config();

module.exports = async function logMessageText(messageText, sentiment, intent, token) {

    const myStorage = new CosmosDbPartitionedStorage({
        cosmosDbEndpoint: process.env.CosmosDbEndpoint,
        authKey: process.env.CosmosDbAuthKey,
        databaseId: process.env.CosmosDbDatabaseId,
        containerId: process.env.CosmosDbContainerId,
        compatibilityMode: false
    });

    storage = myStorage;

    
    try {
        var storeItems = {}
        var new_id = uuid();
        storeItems[new_id] = { 
            "message": messageText,
            "message_tokenized": token,
            "luis_intent": intent[0],
            "luis_intent_score": intent[1],
            "luis_sentiment": intent[2],
            "negative_score": sentiment[3],
            "neutral_score": sentiment[2],
            "positive_score": sentiment[1],
            "sentiment": sentiment[0],
            "timestamp": ""
        }
        console.log(storeItems)

        try {
            await storage.write(storeItems)
        } catch (err) {
            console.log(`Write failed: ${err}`);
        }
    }
    catch (err){
        console.log(`Read rejected. ${err}`);
    }
}
