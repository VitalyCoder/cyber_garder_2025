# Cyber Garden 2025 — Server (NestJS)

Бэкенд сервиса «ZenBalance / Cyber Garden 2025» на NestJS и Prisma. Ниже — подробная документация эндпоинтов, требования к окружению и примеры запросов.

## Базовая информация

- Базовый URL: `http://localhost:4200/api` (настраивается через `.env` переменную `BASE_URL`/`API_PORT`/`API_PREFIX`)
- Формат: JSON
- CORS: включён. В DEV допускается `origin: *`.
- Валидация: DTO через `class-validator` и `ValidationPipe (transform + whitelist)`.
- Авторизация: на текущем этапе эндпоинты публичные (токен не требуется). Переменная `JWT_SECRET_KEY` зарезервирована.
- Swagger (dev): доступен по `http://localhost:4200/api/docs`.

## Окружение

Переменные `.env` (важное):

- `API_PORT='4200'`
- `API_PREFIX="api"`
- `BASE_URL="http://localhost:4200/api"`
- `DATABASE_URL=postgresql://postgres:root@localhost:5436/cyber_garder_2025?schema=public`

База данных: PostgreSQL (Prisma). Схема и миграции описаны в `prisma/schema.prisma`.

## Эндпоинты

### Пользователи (`/users`)

Создание пользователя

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
- Ответ: `200 OK` — объект пользователя (Prisma `User`).

Получить пользователя по id

- `GET /users/:id`
- Ответ: `200 OK` — объект пользователя или `null`.

Получить пользователя по никнейму

- `GET /users/by-nickname/:nickname`
- Ответ: `200 OK` — объект пользователя или `null`.

Обновить пользователя

- `PATCH /users/:id`
- Тело (любые из полей, все опциональные):
  ```json
  {
    "monthlyIncome": 130000,
    "monthlySavings": 25000,
    "currentSavings": 60000,
    "useSavingsCalculation": false
  }
  ```
- Ответ: `200 OK` — обновлённый пользователь.

Удалить пользователя

- `DELETE /users/:id`
- Ответ: `200 OK` — пусто.

### Настройки пользователя (`/users/:userId/settings`)

Создать/обновить настройки

- `POST /users/:userId/settings`
- Тело:
  ```json
  {
    "notificationFrequency": "daily", // daily | weekly | monthly
    "notificationChannel": "browser" // browser | email | telegram
  }
  ```
- Ответ: `200 OK` — объект `UserSettings`.

Получить настройки

- `GET /users/:userId/settings`
- Ответ: `200 OK` — объект `UserSettings` или `null`.

### Вишлист (`/users/:userId/wishlist`)

Добавить запись вишлиста

- `POST /users/:userId/wishlist`
- Тело:
  ```json
  {
    "productName": "Наушники",
    "price": 7990,
    "category": "Гаджеты",
    "coolingPeriodDays": 7,
    "unlockDate": "2025-01-10T00:00:00.000Z" // опционально
  }
  ```
- Ответ: `200 OK` — `{ "id": "uuid" }`.

Список записей пользователя

- `GET /users/:userId/wishlist`
- Ответ: `200 OK` — массив элементов:
  ```json
  [
    {
      "id": "uuid",
      "productName": "Наушники",
      "price": 7990,
      "category": "Гаджеты",
      "coolingPeriodDays": 7,
      "unlockDate": null,
      "status": "waiting", // waiting | ready | bought | cancelled
      "aiRecommendation": null,
      "createdAt": "2025-01-06T12:00:00.000Z"
    }
  ]
  ```

Обновить статус записи

- `PATCH /users/:userId/wishlist/:id/status`
- Тело:
  ```json
  { "status": "ready" }
  ```
- Ответ: `200 OK` — пусто.

Добавить AI-рекомендацию

- `PATCH /users/:userId/wishlist/:id/ai-recommendation`
- Тело:
  ```json
  { "recommendation": "Отложить покупку на 7 дней" }
  ```
- Ответ: `200 OK` — пусто.

Удалить запись

- `DELETE /users/:userId/wishlist/:id`
- Ответ: `200 OK` — пусто.

### Чёрный список категорий (`/users/:userId/blacklist`)

Список

- `GET /users/:userId/blacklist`
- Ответ: `200 OK` — массив категорий.

Добавить категорию

- `POST /users/:userId/blacklist`
- Тело:
  ```json
  { "name": "Гаджеты" }
  ```
- Ответ: `200 OK` — созданная категория.

Удалить категорию

- `DELETE /users/:userId/blacklist/:id`
- Ответ: `200 OK` — пусто.

Проверить существование категории

- `GET /users/:userId/blacklist/exists?name=Гаджеты`
- Ответ: `200 OK` — `true | false`.

### Диапазоны охлаждения по цене (`/users/:userId/cooling-ranges`)

Список

- `GET /users/:userId/cooling-ranges`
- Ответ: `200 OK` — массив `CoolingRange`.

Добавить диапазон

- `POST /users/:userId/cooling-ranges`
- Тело:
  ```json
  {
    "min": 0,
    "max": 10000, // или null
    "days": 7
  }
  ```
- Ответ: `200 OK` — созданный диапазон.

Удалить диапазон

- `DELETE /users/:userId/cooling-ranges/:id`
- Ответ: `200 OK` — пусто.

Подобрать диапазон по цене

- `GET /users/:userId/cooling-ranges/find?price=7990`
- Ответ: `200 OK` — подходящий диапазон или `null`.

### История действий (`/users/:userId/history`)

Добавить событие

- `POST /users/:userId/history`
- Тело:
  ```json
  {
    "action": "bought", // bought | cancelled | removed | postponed
    "productName": "Наушники", // опционально
    "price": 7990 // опционально
  }
  ```
- Ответ: `200 OK` — пусто.

Список истории

- `GET /users/:userId/history`
- Ответ: `200 OK` — массив:
  ```json
  [
    {
      "id": "uuid",
      "action": "bought",
      "productName": "Наушники",
      "price": 7990,
      "actionDate": "2025-01-06T12:00:00.000Z"
    }
  ]
  ```

### Исключения для уведомлений (`/users/:userId/notifications/excluded`)

Список

- `GET /users/:userId/notifications/excluded`
- Ответ: `200 OK` — массив исключённых товаров.

Добавить исключение

- `POST /users/:userId/notifications/excluded`
- Тело:
  ```json
  {
    "productName": "Наушники",
    "wishlistId": "uuid-wishlist" // опционально
  }
  ```
- Ответ: `200 OK` — созданная запись.

Удалить исключение

- `DELETE /users/:userId/notifications/excluded/:id`
- Ответ: `200 OK` — пусто.

Проверить существование исключения

- `GET /users/:userId/notifications/excluded/exists?productName=Наушники`
- Ответ: `200 OK` — `true | false`.

## Как запустить локально

```bash
# Установка зависимостей
npm install

# Генерация Prisma client (опционально, если меняли схему)
npm run prisma:generate

# Запуск dev
npm run start:dev

# Swagger (dev)
open http://localhost:4200/api/docs
```

Docker Compose (из корня репозитория или из `server/`):

```bash
docker compose up -d
```

## Примечания и оговорки

- Версионирование API по URI объявлено, но версия может быть не задана в `.env` (в dev используется базовый префикс `/api`).
- Валидация тел запросов — строгая: лишние поля отбрасываются, типы приводятся.
- Ошибки клиента проходят через глобальный интерцептор `ClientExceptionsInterceptor` и фильтр `ExceptionFilter`.

## Лицензия

MIT (для этого сервиса).
