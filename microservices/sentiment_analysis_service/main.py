from fastapi import FastAPI
from pydantic import BaseModel
from textblob import TextBlob
from better_profanity import profanity

app = FastAPI()

class ConfessionInput(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_confession(data: ConfessionInput):

    sentiment = TextBlob(data.text).sentiment.polarity

    if sentiment > 0:
        mood = "positive"
    elif sentiment < 0:
        mood = "negative"
    else:
        mood = "neutral"

    contains_profanity = profanity.contains_profanity(data.text)

    return {
        "sentiment": mood,
        "profanity": contains_profanity
    }