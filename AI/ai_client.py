import json
import httpx
from openai import AsyncOpenAI
from config import settings

# Клиент OpenAI с настраиваемыми таймаутом и числом ретраев
# Важно держать таймаут меньше, чем timeout на Nest-сервисе (20s по умолчанию)
client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    http_client=httpx.AsyncClient(timeout=settings.OPENAI_TIMEOUT),
    max_retries=settings.OPENAI_MAX_RETRIES,
)

async def ask_gpt_json(prompt: str, temperature: float = 0.7) -> dict:
    """
    Отправляет запрос в GPT и возвращает чистый JSON.
    Обрабатывает ошибки парсинга и таймауты.
    """
    messages = [
        {
            "role": "system",
            "content": "Always return valid JSON. No markdown formatting."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    try:
        response = await client.chat.completions.create(
            model=settings.MODEL,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
            max_tokens=1000
        )

        # УНИВЕРСАЛЬНОЕ ЧТЕНИЕ ОТВЕТА
        content = ""
        if hasattr(response, 'choices'):
            content = response.choices[0].message.content
        elif isinstance(response, dict):
            content = response['choices'][0]['message']['content']
        else:
            content = response.choices[0].message.content

        if not content:
            raise ValueError("Empty response from AI")

        return json.loads(content)

    except json.JSONDecodeError:
        return {"error": "Invalid JSON"}
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return {}

async def ask_perplexity(messages: list) -> dict:
    """
    Запрос к Perplexity API для поиска в интернете.
    """
    if not settings.PERPLEXITY_API_KEY:
        print("Perplexity API key not found")
        return None

    headers = {
        "Authorization": f"Bearer {settings.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "sonar-reasoning-pro",
        "messages": messages,
        "temperature": 0.1
    }

    async with httpx.AsyncClient(timeout=60.0) as http_client:
        try:
            response = await http_client.post(
                "https://api.perplexity.ai/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            content = data['choices'][0]['message']['content']
            clean_json = content.replace("``````", "").strip()
            return json.loads(clean_json)

        except Exception as e:
            print(f"Perplexity Error: {e}")
            return None
