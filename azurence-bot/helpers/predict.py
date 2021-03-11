########### Python 3.6 #############

#
# This quickstart shows how to predict the intent of an utterance by using the LUIS REST APIs.
#

import requests
from config import DefaultConfig


class LuisPredictor:
    # @staticmethod
    def execute_luis_query(self, utterance: str):
        try:

            ##########
            # Values to modify.

            # YOUR-APP-ID: The App ID GUID found on the www.luis.ai Application Settings page.
            appId = DefaultConfig.appId

            # YOUR-PREDICTION-KEY: Your LUIS authoring key, 32 character value.
            prediction_key = DefaultConfig.prediction_key

            # YOUR-PREDICTION-ENDPOINT: Replace with your authoring key endpoint.
            # For example, "https://westus.api.cognitive.microsoft.com/"
            prediction_endpoint = DefaultConfig.prediction_endpoint

            # The utterance you want to use.
            # utterance = 'People are mean to me.'
            ##########

            # The headers to use in this REST call.
            headers = {
            }

            # The URL parameters to use in this REST call.
            params = {
                'query': utterance,
                'timezoneOffset': '0',
                'verbose': 'true',
                'show-all-intents': 'true',
                'spellCheck': 'false',
                'staging': 'false',
                'subscription-key': prediction_key
            }

            # Make the REST call.
            response = requests.get(f'{prediction_endpoint}luis/prediction/v3.0/apps/{appId}/slots/production/predict',
                                    headers=headers, params=params)

            # Display the results on the console.
            # print(response.json())
            return response.json()


        except Exception as e:
            # Display the error string.
            print(f'{e}')


if __name__ == '__main__':
    utterance = "Hi there."
    try_this = LuisPredictor()
    try_this.execute_luis_query(utterance)
