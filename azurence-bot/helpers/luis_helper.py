# import Intent as Intent
from enum import Enum

from botbuilder.ai.luis import LuisRecognizer
from botbuilder.core import TurnContext

from booking_details import BookingDetails


class Intent(Enum):
    BOOK_FLIGHT = "BookFlight"
    CANCEL = "Cancel"
    GET_WEATHER = "GetWeather"
    NONE_INTENT = "NoneIntent"


class LuisHelper:
    @staticmethod
    async def execute_luis_query(
            luis_recognizer: LuisRecognizer, turn_context: TurnContext
    ) -> (Intent, object):
        """
        Returns an object with preformatted LUIS results for the bot's dialogs to consume.
        """
        result = None
        intent = None

        try:
            recognizer_result = await luis_recognizer.recognize(turn_context)
            print(recognizer_result)
            intent = (
                sorted(
                    recognizer_result.intents,
                    key=recognizer_result.intents.get,
                    reverse=True,
                )[:1][0]
                if recognizer_result.intents
                else None
            )
            print(intent)


            if intent == Intent.BOOK_FLIGHT.value:
                result = BookingDetails()

                # We need to get the result from the LUIS JSON which at every level returns an array.
                to_entities = recognizer_result.entities.get("$instance", {}).get(
                    "To", []
                )
                if len(to_entities) > 0:
                    if recognizer_result.entities.get("To", [{"$instance": {}}])[0][
                        "$instance"
                    ]:
                        result.destination = to_entities[0]["text"].capitalize()
                    else:
                        result.unsupported_airports.append(
                            to_entities[0]["text"].capitalize()
                        )

                from_entities = recognizer_result.entities.get("$instance", {}).get(
                    "From", []
                )
                if len(from_entities) > 0:
                    if recognizer_result.entities.get("From", [{"$instance": {}}])[0][
                        "$instance"
                    ]:
                        result.origin = from_entities[0]["text"].capitalize()
                    else:
                        result.unsupported_airports.append(
                            from_entities[0]["text"].capitalize()
                        )

                # This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop
                # the Time part. TIMEX is a format that represents DateTime expressions that include some ambiguity.
                # e.g. missing a Year.
                date_entities = recognizer_result.entities.get("datetime", [])
                if date_entities:
                    timex = date_entities[0]["timex"]

                    if timex:
                        datetime = timex[0].split("T")[0]

                        result.travel_date = datetime

                else:
                    result.travel_date = None

        except Exception as exception:
            print(exception)

        return intent, result
