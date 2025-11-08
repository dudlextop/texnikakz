# Texnika.kz

## Описание проекта
Texnika.kz — маркетплейс спецтехники и операторов для Казахстана. Платформа объединяет владельцев техники и специалистов-операторов, помогая быстро находить надежных исполнителей и продвигать объявления.

## Текущий статус
MVP готов и активно развивается: доступны основные пользовательские сценарии, админ-инструменты и mock-биллинг для продвижения объявлений.

## Структура монорепозитория
- `apps/`
  - `web/` — клиентское приложение на Next.js 14
  - `api/` — backend на NestJS
  - `admin/` — административная панель на Next.js
- `packages/`
  - `shared/` — общие типы и константы домена
  - `ui/` — общие UI-компоненты на базе shadcn/ui
  - `workers/` — фоновые задачи и очереди BullMQ
- `infrastructure/` — docker-compose и инфраструктурные конфигурации
- `db/` — Prisma-схемы, миграции и сиды
- `docs/` — дополнительная документация
- `scripts/` — служебные скрипты разработки и деплоя

## Технологический стек
- Next.js 14 (App Router, SSR, i18n)
- NestJS (REST API, Swagger)
- PostgreSQL + Prisma
- Redis + BullMQ
- MinIO (S3-совместимое хранилище)
- OpenSearch
- Docker / Docker Compose

## Запуск локальной среды
1. Установите Docker Desktop и pnpm: `npm install -g pnpm`.
2. Скопируйте `.env.example` в `.env` и при необходимости скорректируйте значения.
3. Поднимите инфраструктуру: `docker compose -f infrastructure/docker-compose.yml up -d`.
4. Установите зависимости: `pnpm install`.
5. Примените миграции и сиды:
   ```bash
   pnpm --filter @texnika/api prisma:migrate deploy
   pnpm --filter @texnika/api prisma:generate
   pnpm --filter @texnika/api prisma:seed
   ```
6. Запустите все сервисы: `pnpm dev`.
7. Откройте в браузере:
   - Web — http://localhost:3000
   - Admin — http://localhost:3002
   - API (Swagger) — http://localhost:3001/api/docs

## Работа с админкой
В административной панели авторизуйтесь под учетной записью администратора, созданной сидом (см. `apps/api/prisma/seed.ts`). После входа доступны модули для управления объявлениями, пользователями и биллингом.

## Основные доменные модули
- `apps/api/src/modules/auth` — аутентификация и управление пользователями
- `apps/api/src/modules/dealers` — дилеры и их инвентарь
- `apps/api/src/modules/listings` — объявления спецтехники
- `apps/api/src/modules/specialists` — каталог операторов
- `apps/api/src/modules/promotions` — промо-механики и активации
- `apps/api/src/modules/billing` — mock-биллинг, заказы и транзакции

## Полезные команды
- `pnpm lint` — запустить линтеры
- `pnpm build` — собрать все приложения
- `pnpm test` — выполнить тесты

