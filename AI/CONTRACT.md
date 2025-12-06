# Контракт: Server ↔ AI (FastAPI)

Документ фиксирует контракт между NestJS-сервером и Python AI-сервисом. Все примеры — JSON. Базовый URL AI: `AI_SERVICE_URL` (например, `http://localhost:5000`). Таймаут клиента: 5–10 секунд; при недоступности AI сервер обязан возвращать валидный офлайн-ответ.

## Общие требования

- Content-Type: `application/json`
- Аутентификация: отсутствует на текущем этапе (может быть добавлена через `Bearer` токен)
- Версионирование: `v1` (в пути)
- Ошибки: стандартный JSON с полями `error`, `code`, `details` (см. ниже)
- Иденпотентность: вызовы чтения/аналитики должны быть идемпотентны

## Эндпоинты

### 1) Семантическая проверка категории против чёрного списка

- Метод: `POST /v1/blacklist/match`
- Вход:

```json
{
	"userId": "uuid-user",
	"candidateCategory": "Гаджеты",
	"blacklist": ["Игры", "Техника"],
	"threshold": 0.7
}
```

- Выход:

```json
{
	"matched": true,
	"score": 0.82,
	"matchedWith": "Техника",
	"reason": "Категория близка к 'Техника' по смыслу"
}
```

- Ошибки:

```json
{
	"error": "BadRequest",
	"code": "VALIDATION_ERROR",
	"details": "threshold must be between 0 and 1"
}
```

### 2) Совет по покупке товара

- Метод: `POST /v1/products/advice`
- Вход:

```json
{
	"user": {
		"monthlyIncome": 120000,
		"monthlySavings": 20000,
		"currentSavings": 50000,
		"useSavingsCalculation": true
	},
	"product": {
		"name": "MacBook Pro",
		"price": 150000,
		"category": "Техника"
	},
	"context": {
		"coolingDays": 30,
		"unlockDate": "2026-01-04T00:00:00.000Z"
	}
}
```

- Выход:

```json
{
	"finalStatus": "COOLING", // APPROVED | BLOCKED | COOLING
	"confidence": 0.74,
	"reason": "Отложите покупку: сейчас лучше накопить ещё",
	"advice": "Рассмотрите альтернативу или подождите 2 недели"
}
```

- Примечания:
  - Если `finalStatus` = `APPROVED` или `BLOCKED` с высокой уверенностью (`confidence >= 0.8`), сервер может скорректировать свой итоговый статус.
  - Сервер всегда валидирует поля и применяет безопасный фолбэк при таймауте/ошибках.

### 3) Генерация чат-ответа (если используется живой чат)

- Метод: `POST /v1/chat/complete`
- Вход:

```json
{
	"messages": [
		{ "role": "system", "content": "Ты финансовый помощник" },
		{ "role": "user", "content": "Стоит ли покупать наушники за 7990?" }
	],
	"userId": "uuid-user",
	"temperature": 0.2,
	"maxTokens": 256
}
```

- Выход:

```json
{
	"message": {
		"role": "assistant",
		"content": "Если это импульсная покупка — отложите на неделю"
	},
	"usage": { "promptTokens": 45, "completionTokens": 28 }
}
```

## Коды ошибок

- `VALIDATION_ERROR` — ошибка валидации входных данных
- `MODEL_UNAVAILABLE` — модель/сервис временно недоступен
- `TIMEOUT` — превышен таймаут
- `INTERNAL_ERROR` — непредвиденная ошибка сервера

Стандартный формат ошибки:

```json
{
	"error": "Timeout",
	"code": "TIMEOUT",
	"details": "completion exceeded 10s"
}
```

## Контракт надёжности

- Сервер вызывает AI с таймаутом (рекомендуется 5–10s) и ретраями (экспоненциальная пауза, до 2 попыток).
- При ошибке/таймауте сервер возвращает офлайн-результаты и пишет событие в лог/метрику.
- AI должен быть статeless или хранить состояние по `userId` безопасно.
