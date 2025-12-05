import json
import asyncio
from openai import AsyncOpenAI
from config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def ask_gpt_json(prompt: str, temperature: float = 0.5) -> dict:
    """
    Если MOCK_AI=True, возвращает заглушку.
    Иначе делает реальный запрос в GPT-4o-mini с гарантией JSON-ответа.
    """

    # НРЕЖИМ ОТЛАДКИ (MOCK)
    if settings.MOCK_AI:
        print(f"\n[MOCK MODE] Запрос перехвачен. AI не вызывается.")
        await asyncio.sleep(0.5) # Имитация задержки сети

        # 1. Синонимизация категорий
        if "related to ANY of these blacklist categories" in prompt:
            print("[MOCK] Возвращаю ответ для 'Category Similarity'")
            return {
                "is_blocked": True,
                "similarity": 0.95,
                "related_to": "Видеоигры",
                "reason": "Это тестовая блокировка в режиме отладки."
            }

        # 2. Финансовый совет
        if "Analyze if this purchase is financially reasonable" in prompt:
            print("[MOCK] Возвращаю ответ для 'Purchase Advice'")
            return {
                "status": "COOLING",
                "advice": "В режиме теста советуем подождать. Это 15% твоего дохода.",
                "key_message": "Слишком дорого (Тест).",
                "confidence": 0.85
            }

        # 3. Опрос
        if "Generate an INTERACTIVE SURVEY" in prompt:
            print("[MOCK] Возвращаю ответ для 'Survey'")
            return {
                "title": "Тестовый опрос 📋",
                "items": [
                    {
                        "product_name": "Тестовый товар",
                        "price": 1000,
                        "question": "Ты всё ещё хочешь это? (Тест)",
                        "status": "waiting",
                        "days_left": 5,
                        "options": [
                            {"label": "Да", "action": "keep"},
                            {"label": "Нет", "action": "delete"},
                            {"label": "Отложить", "action": "postpone"}
                        ]
                    }
                ],
                "message": "Это тестовая генерация опроса."
            }

        # 4. Мотивация
        if "Generate a SHORT motivational message" in prompt:
            print("[MOCK] Возвращаю ответ для 'Motivation'")
            return {
                "message": "Ты молодец! Тестовая мотивация работает отлично! 💪"
            }

        return {"error": "Mock type not recognized"}
    try:
        response = await client.chat.completions.create(
            model=settings.MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} if settings.JSON_MODE else None,
            temperature=temperature,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")

        return json.loads(content)

    except json.JSONDecodeError:
        # Fallback на случай битого JSON
        raise ValueError("Failed to decode JSON from LLM response")
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise e
