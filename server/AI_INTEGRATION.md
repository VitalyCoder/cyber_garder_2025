# ZenBalance AI — Документация для разработки нейросервиса

## Обзор

ZenBalance AI — отдельный Python FastAPI‑сервис, который выполняет:

- Синонимизацию категорий и проверку на «чёрный список»
- Финансовый совет по покупке
- Генерацию интерактивного опроса (для нотификаций)
- Мотивирующие сообщения

Все ответы — строго валидный JSON (без Markdown, без префиксов). Наш NestJS‑бэкенд обращается к этому сервису по `AI_SERVICE_URL`.

## Архитектура

- Язык/Фреймворк: Python 3.10+ / FastAPI / Uvicorn
- Библиотеки: `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`, `openai` (или совместимая SDK), `httpx`/`requests`
- Модули:
  - `main.py` — FastAPI app + эндпойнты
  - `prompts.py` — системный промт + шаблоны LLM
  - `schemas.py` — Pydantic‑модели входа/выхода
  - `ai_client.py` — обёртка над OpenAI SDK (JSON mode, таймауты/ретраи)
  - `config.py` — чтение env и параметры модели
  - `tests/` — юнит‑/контрактные тесты

## Окружение (.env)

```env
OPENAI_API_KEY=sk-xxx
MODEL=gpt-4o-mini
PORT=5000
ALLOW_ORIGINS=*
JSON_MODE=true        # включает response_format={"type":"json_object"}
TIMEOUT_MS=3000
```

Рекомендации по temperature:

- Категории: 0.2
- Опрос: 0.5
- Мотивация: 0.7

## Контракты эндпойнтов

Ошибки: HTTP 4xx/5xx, JSON вида `{ "error": "...", "details": { ... } }`.

### 1) POST /ai/category-similarity

Синонимизация категорий и проверка на «чёрный список».

Вход:

```json
{
  "user_category": "Игровая консоль",
  "blacklist_categories": ["Техника", "Видеоигры", "Гаджеты"]
}
```

Выход:

```json
{
  "is_blocked": true,
  "similarity": 0.95,
  "related_to": "Видеоигры, Техника",
  "reason": "Игровая консоль — это оборудование для видеоигр (запрещено)"
}
```

Бизнес‑правило на бэке: если `is_blocked === true` и `similarity > 0.7`, то `/products/check` возвращает `BLOCKED`.

Промт: всегда на русском, строго JSON, сравнивай `user_category` против списка, оцени `similarity` (0..1), поясни причину.

### 2) POST /ai/purchase-advice

Короткий финансовый совет и статус покупки.

Вход:

```json
{
  "product_name": "MacBook Pro",
  "price": 150000,
  "user_income": 100000,
  "user_savings": 80000,
  "monthly_savings": 5000,
  "cooling_days": 30
}
```

Выход:

```json
{
  "status": "COOLING",
  "advice": "Это 15% твоего дохода. Подожди 30 дней, накопишь еще 5k...",
  "key_message": "Слишком дорого. Отложи на месяц.",
  "confidence": 0.85
}
```

Маппинг на наш API: `advice` → `ai_advice`, `key_message` → `ai_reason`.

### 3) POST /ai/generate-survey

Генерация интерактивного опроса (для нотификаций).

Вход:

```json
{
  "wishlist_items": [
    {
      "name": "MacBook Pro",
      "price": 150000,
      "days_left": 20,
      "status": "WAITING"
    },
    { "name": "Наушники", "price": 12000, "days_left": 7, "status": "WAITING" }
  ],
  "nickname": "Ivan",
  "monthly_savings": 5000
}
```

Выход:

```json
{
  "title": "Твой еженедельный финансовый опрос 📋",
  "items": [
    {
      "name": "MacBook Pro",
      "question": "Ты всё ещё хочешь это?",
      "status_hint": "Ждёт 20 дней ⏱️",
      "options": [
        "Да, по-прежнему хочу",
        "Нет, удалить",
        "Отложить еще на неделю"
      ]
    }
  ],
  "message": "Пересмотри свои желания и скажи, что-то из этого больше не нужно? ✨"
}
```

### 4) POST /ai/motivation

Короткие мотивирующие сообщения.

Вход:

```json
{
  "action": "product_removed",
  "product_name": "MacBook Pro",
  "nickname": "Ivan",
  "price": 150000,
  "savings_delta": 5000
}
```

Выход:

```json
{ "message": "Выиграл! Пропустил импульс на 15k. Это +1% ближе к целям. 💪" }
```

## Pydantic‑схемы (пример)

```python
from pydantic import BaseModel, conlist, confloat, Field

class CategorySimilarityRequest(BaseModel):
    user_category: str
    blacklist_categories: conlist(str, min_items=0) = []

class CategorySimilarityResponse(BaseModel):
    is_blocked: bool
    similarity: confloat(ge=0.0, le=1.0)
    related_to: str | None = None
    reason: str

class PurchaseAdviceRequest(BaseModel):
    product_name: str
    price: int
    user_income: int
    user_savings: int
    monthly_savings: int
    cooling_days: int

class PurchaseAdviceResponse(BaseModel):
    status: str = Field(pattern='^(APPROVED|COOLING|BLOCKED)$')
    advice: str
    key_message: str
    confidence: confloat(ge=0.0, le=1.0)
```

## Best practices

- JSON mode: `response_format={"type":"json_object"}`; если парсинг не удался — 502 и `{ error: "invalid_json" }`.
- Таймауты/ретраи: 3–5 сек таймаут, 1 ретрай (backoff 200–500 ms); при падении — офлайн‑ответ.
- Логи: `request_id`, `duration_ms`, тип функции; не логировать промты и ключи.
- Валидация: Pydantic на вход/выход, 400 на невалидный вход.
- CORS: `*` локально; в проде — ограничить домены.
- Модель: GPT‑4o‑mini (скорость/качество/стоимость); темп: 0.2/0.5/0.7.
- Тесты: контрактные, моки SDK, негативные кейсы (таймаут, invalid JSON, пустые данные).

## Пример FastAPI (упрощённо)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import CategorySimilarityRequest, CategorySimilarityResponse
from ai_client import ask_model_json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ai/category-similarity", response_model=CategorySimilarityResponse)
async def category_similarity(data: CategorySimilarityRequest):
    prompt = f"""Determine relation of '{data.user_category}' to blacklist:
{data.blacklist_categories}
Return JSON with is_blocked, similarity (0..1), related_to, reason (RU)."""
    try:
      result = await ask_model_json(prompt, temperature=0.2)
      return CategorySimilarityResponse(**result)
    except Exception as e:
      raise HTTPException(status_code=502, detail={"error": "ai_unavailable", "message": str(e)})
```

## Интеграция с NestJS

Наш сервер вызывает:

- `POST /ai/category-similarity` → решаем `BLOCKED/OK`
- `POST /ai/purchase-advice` → добавляем `ai_reason`/`ai_advice` в `/products/check`
- `POST /ai/generate-survey` → формируем нотификацию/опрос
- `POST /ai/motivation` → тост/история

Адрес: `AI_SERVICE_URL` из `.env` бекенда. Если сервис недоступен — бэкенд деградирует до офлайн‑логики.
