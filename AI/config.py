import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

    MODEL = os.getenv("MODEL", "gpt-4o-mini")
    PERPLEXITY_MODEL = os.getenv("PERPLEXITY_MODEL", "sonar-pro")

    PORT = int(os.getenv("PORT", 5000))

    # Таймауты/ретраи для OpenAI клиента (секунды)
    OPENAI_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT", 15.0))
    # По умолчанию без повторов, чтобы уложиться в 20s таймаут Nest-сервиса
    OPENAI_MAX_RETRIES = int(os.getenv("OPENAI_MAX_RETRIES", 0))

    JSON_MODE = os.getenv("JSON_MODE", "true").lower() == "true"
    MOCK_AI = os.getenv("MOCK_AI", "false").lower() == "true"

    TEMP_CATEGORY = 0.2
    TEMP_SURVEY = 0.5
    TEMP_ADVICE = 0.5
    TEMP_MOTIVATION = 0.7

    # Логирование
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Config()
