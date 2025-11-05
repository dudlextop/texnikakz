# Texnika.kz API

NestJS BFF, Prisma ORM, PostgreSQL, Redis, OpenSearch.

## Требования к окружению
- Node.js 18+
- pnpm 8+
- PostgreSQL 15 (совместимо с docker-compose)
- Redis, MinIO, OpenSearch (поднимаются через `infrastructure/docker-compose.yml`)

## Основные команды
```bash
pnpm --filter @texnika/api start:dev     # запуск API в режиме разработки
pnpm --filter @texnika/api build         # сборка
pnpm --filter @texnika/api lint          # линтинг
```

## Работа с Prisma
Перед выполнением команд убедитесь, что PostgreSQL доступен (например, через docker compose).

```bash
pnpm --filter @texnika/api prisma:migrate   # применить миграции (development)
pnpm --filter @texnika/api prisma:gen       # сгенерировать Prisma Client
pnpm --filter @texnika/api prisma:seed      # засеять демо-данные (150 объявлений, 50 специалистов)
```

> ⚠️ Эти команды не выполнялись автоматически в репозитории. Запускайте их вручную.

## Структура данных (кратко)
- **Region / City / Category** — справочники регионов, городов и категорий техники
- **User / Dealer** — аккаунты пользователей и дилеров, роли и планы
- **Listing / Media / Promotion** — объявления спецтехники, медиафайлы, продвижения
- **Specialist / SpecialistPromotion** — карточки операторов спецтехники и их продвижение
- **Review / Favorite** — отзывы и избранное
- **Conversation / Message** — чаты между пользователями и специалистами/продавцами
- **Order** — mock-заказы и оплаты (VIP/TOP и т.д.)
- **AuditLog** — аудит действий администраторов

## Seed-данные
Скрипт `prisma/seed.ts` наполняет БД демо-контентом:
- 13 регионов, 20 городов Казахстана
- 10 категорий техники
- 4 дилера и связанные пользователи
- 60+ пользовательских аккаунтов
- 50 специалистов с портфолио, отзывами и продвижениями
- 150 объявлений (частные и дилерские), часть с промоуслугами
- 20 чатов с сообщениями

После сидирования можно подключать OpenSearch-индексатор и фронтенд.
