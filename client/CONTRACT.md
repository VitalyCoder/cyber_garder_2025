# Контракт: Client ↔ Server (HTTP/WebSocket)

Документ фиксирует основные запросы клиента к NestJS-серверу и формат событий WebSocket.

Базовый URL API: `http://localhost:4200/api` (см. `.env` в `server/`). Формат: JSON.

## Авторизация

- На текущем этапе — публичные эндпоинты.
- В будущем: `Bearer` токен в заголовке `Authorization`.

## HTTP API

### Пользователи

- `POST /users`

  - Тело:

  ```json
  {
  	"nickname": "neo",
  	"monthlyIncome": 120000,
  	"monthlySavings": 20000,
  	"currentSavings": 50000,
  	"useSavingsCalculation": true
  }
  ```

  - Ответ: объект пользователя.

- `GET /users/:id`
- `GET /users/by-nickname/:nickname`
- `PATCH /users/:id` — частичное обновление.
- `DELETE /users/:id`

### Настройки пользователя

- `POST /users/:userId/settings`
- `GET /users/:userId/settings`

### Чёрный список категорий

- `GET /users/:userId/blacklist`
- `POST /users/:userId/blacklist` — `{ "name": "Гаджеты" }`
- `DELETE /users/:userId/blacklist/:id`
- `GET /users/:userId/blacklist/exists?name=Гаджеты`

### Диапазоны охлаждения

- `GET /users/:userId/cooling-ranges`
- `POST /users/:userId/cooling-ranges` — `{ "min": 0, "max": 10000, "days": 7 }`
- `DELETE /users/:userId/cooling-ranges/:id`
- `GET /users/:userId/cooling-ranges/find?price=7990`

### Вишлист

- `POST /users/:userId/wishlist` — добавить запись
- `GET /users/:userId/wishlist` — список
- `PATCH /users/:userId/wishlist/:id/status` — изменить статус `{ "status": "ready" }`
- `PATCH /users/:userId/wishlist/:id/ai-recommendation` — добавить рекомендацию
- `DELETE /users/:userId/wishlist/:id`

### История

- `POST /users/:userId/history` — добавить событие
- `GET /users/:userId/history` — список

### Проверка товара (главная функция)

- `POST /products/check`
  - Тело:
  ```json
  {
  	"userId": "uuid-user",
  	"productName": "MacBook Pro",
  	"price": 150000,
  	"category": "Техника"
  }
  ```
  - Ответ:
  ```json
  {
  	"status": "COOLING",
  	"cooling_days": 30,
  	"unlock_date": "2026-01-04T00:00:00.000Z",
  	"ai_reason": "Отложите покупку: сейчас лучше накопить ещё",
  	"ai_advice": "Рассмотрите альтернативу или подождите 2 недели",
  	"can_afford_now": false
  }
  ```

## WebSocket (чат, уведомления)

- Подключение: `ws://localhost:4200/ws` (пример, см. `server/src/nest/chat.gateway.ts`).
- Пространство/канал: `chat` (уточнить по реализации).
- События:
  - `chat:message`
    - Вход:
    ```json
    { "userId": "uuid-user", "content": "Стоит ли покупать наушники?" }
    ```
    - Выход:
    ```json
    { "role": "assistant", "content": "Отложите импульсную покупку на неделю" }
    ```
  - Уведомления о смене статуса вишлиста: `wishlist:status`
    - Пэйлоад:
    ```json
    { "id": "uuid", "status": "ready" }
    ```

## Ошибки

Стандартный ответ ошибки HTTP:

```json
{
	"statusCode": 400,
	"message": "Validation failed",
	"error": "Bad Request"
}
```

## Требования клиента

- Все запросы — `application/json`.
- Рекомендуется показывать пользователю причины (`ai_reason`) и советы (`ai_advice`) из ответа `/products/check`.
- При сетевых ошибках — ретраи (до 2 попыток) и дружелюбные сообщения.
