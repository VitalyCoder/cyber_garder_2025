# hack

## Cyber Garden 2025 — ZenBalance

Монорепозиторий проекта ZenBalance (Cyber Garden 2025):

- `client/` — фронтенд (React + TypeScript + Vite)
- `server/` — бэкенд (NestJS + Prisma + PostgreSQL)
- `AI/` — Python сервис (FastAPI) для AI-интеграции

### Быстрый старт

1. Установите зависимости в `client/` и `server/`.
2. Поднимите базу данных (см. `server/docker-compose.yml`) и выполните генерацию Prisma.
3. Запустите `server` и `client` в dev-режиме.
4. При необходимости запустите AI-сервис и укажите `AI_SERVICE_URL`.

Подробнее — в `server/README.md` и `client/README.md`.

### Контракты взаимодействия

- Контракт сервер ↔ AI-сервис: `AI/CONTRACT.md`
- Контракт клиент ↔ сервер (HTTP/WebSocket): `client/CONTRACT.md`

Эти документы фиксируют форматы запросов/ответов, коды ошибок, таймауты и требования к окружению.

### Продакшен

См. `docker-compose.prod.yaml` и `client/Dockerfile.prod`, `server/Dockerfile.prod`, `AI/Dockerfile.prod` для контейнеризации и деплоя.
