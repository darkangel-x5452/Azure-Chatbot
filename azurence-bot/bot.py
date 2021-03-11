import time
import uuid
from datetime import datetime

import nltk
from botbuilder.azure import CosmosDbPartitionedStorage, CosmosDbPartitionedConfig
from botbuilder.core import ActivityHandler, TurnContext, ConversationState, UserState
from nltk.corpus import stopwords

from config import DefaultConfig
from data_models.conversation_data import ConversationData
from helpers import sample_analyze_sentiment
from helpers import predict
nltk.download('stopwords')
from nltk.tokenize import word_tokenize


CONFIG = DefaultConfig()


class MyBot(ActivityHandler, ):
    """
    Represents a bot saves and echoes back user input.
    """

    # def __init__(self):
    #     self.storage = MemoryStorage()
    def __init__(self, conversation_state: ConversationState, user_state: UserState):

        # User State part
        #####
        self.conversation_state = conversation_state
        self.user_state = user_state
        self.conversation_data_accessor = self.conversation_state.create_property(
            "ConversationData"
        )
        self.user_profile_accessor = self.user_state.create_property("UserProfile")
        self.channel_name = "UtteranceLog"
        self.message_timestamp = datetime.now()
        self.doc_id = None
        ######

        # Bot Part
        cosmos_config = CosmosDbPartitionedConfig(
            cosmos_db_endpoint=CONFIG.COSMOS_DB_ENDPOINT,
            auth_key=CONFIG.COSMOS_DB_AUTH_KEY,
            database_id=CONFIG.COSMOS_DB_DATABASE_ID,
            container_id=CONFIG.COSMOS_DB_CONTAINER_ID,
            compatibility_mode=False
        )
        self.storage = CosmosDbPartitionedStorage(cosmos_config)

    async def on_message_activity(self, turn_context: TurnContext):
        # User State
        #####
        conversation_data = await self.conversation_data_accessor.get(
            turn_context, ConversationData
        )
        conversation_data.timestamp = self.__datetime_from_utc_to_local(
            turn_context.activity.timestamp
        )
        conversation_data.channel_id = turn_context.activity.channel_id
        self.channel_name = conversation_data.channel_id
        self.message_timestamp = conversation_data.timestamp
        #####
        utterance = turn_context.activity.text
        # Tokenize the sentence.
        #####
        text_tokens = word_tokenize(utterance)
        tokens_without_sw = [word for word in text_tokens if not word in stopwords.words()]
        tokenized = [word for word in tokens_without_sw if word.isalpha()]
        tokenized_str = " ".join(tokenized)
        #####
        # Get LUIS Intent
        #####
        luis_predictor = predict.LuisPredictor()
        luis_query = luis_predictor.execute_luis_query(utterance=utterance)
        luis_intent = luis_query["prediction"]["topIntent"]
        luis_intent_score = list(luis_query["prediction"]["intents"].values())[0]["score"]
        luis_sentiment = luis_query["prediction"]["sentiment"]["label"]
        #####
        # Separate sentiment Analyser. read the state object
        sentiment = sample_analyze_sentiment.AnalyzeSentimentSample()
        sentiment_val = sentiment.analyze_sentiment([utterance])
        new_id = str(uuid.uuid4())

        # add the utterance to a new state object.
        channel_name = conversation_data.channel_id
        message_timestamp = conversation_data.timestamp

        document = {
            "message": utterance,
            "timestamp": message_timestamp,
            "sentiment": sentiment_val[0].sentiment,
            "negative_score": sentiment_val[0].confidence_scores.negative,
            "positive_score": sentiment_val[0].confidence_scores.positive,
            "neutral_score": sentiment_val[0].confidence_scores.neutral,
            "luis_sentiment": luis_sentiment,
            "luis_intent": luis_intent,
            "luis_intent_score": luis_intent_score,
            "channel_name": channel_name,
            "message_tokenized": tokenized_str
        }
        result = str(list(document.values()))
        # Show user list of utterances.
        await turn_context.send_activity(f"{self.channel_name}: "
                                         f"The list is now: {result}")

        try:
            # Save the user message to your Storage.
            changes = {new_id: document}
            await self.storage.write(changes)
        except Exception as exception:
            # Inform the user an error occurred.
            await turn_context.send_activity("Sorry, something went wrong storing your message!")

    def __datetime_from_utc_to_local(self, utc_datetime):
        now_timestamp = time.time()
        offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(
            now_timestamp
        )
        result = utc_datetime + offset
        return result.strftime("%I:%M:%S %p, %A, %B %d of %Y")
