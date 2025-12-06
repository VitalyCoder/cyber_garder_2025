import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MODEL = os.getenv("MODEL", "gpt-4o-mini")
    PORT = int(os.getenv("PORT", 5000))
    JSON_MODE = os.getenv("JSON_MODE", "true").lower() == "true"

    MOCK_AI = os.getenv("MOCK_AI", "false").lower() == "true"

    TEMP_CATEGORY = 0.2
    TEMP_SURVEY = 0.5
    TEMP_ADVICE = 0.5
    TEMP_MOTIVATION = 0.7

settings = Config()
