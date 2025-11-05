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

## Аутентификация (OTP + JWT cookies)

- `POST /api/auth/otp/request` — запрашивает одноразовый код (для разработки возвращается `devCode=1111`).
- `POST /api/auth/otp/verify` — проверяет код, создаёт пользователя при первом входе и устанавливает JWT в httpOnly cookie.
- `POST /api/auth/logout` — очищает сессионную cookie.

JWT хранится в cookie `texnika_session` (имя переопределяется переменной `AUTH_COOKIE_NAME`), срок действия по умолчанию 7 дней.

## Пользователи

- `GET /api/users/me` — возвращает профиль текущего пользователя с базовой информацией о привязанном дилере (если есть).

## Дилеры

- `GET /api/dealers/:id` — публичная карточка дилера (по ID или slug).
- `GET /api/dealers/:id/stats` — агрегированные счётчики объявлений, заказов и членов команды.
- `POST /api/dealers` — создание дилера (только роль moderator/admin).
- `PUT /api/dealers/:id` — обновление дилера (только роль moderator/admin).
- `DELETE /api/dealers/:id` — удаление дилера (только роль moderator/admin).

## Объявления

- `GET /api/listings` — публичный поиск с фильтрами (`q`, `categoryId`, `cityId`, `dealerId`, `priceFrom/priceTo`, `yearFrom/yearTo`, `hasMedia`) и сортировками (`newest`, `price_asc`, `price_desc`, `year_desc`). В ответе — пагинация и фасеты по категориям.
- `GET /api/listings/:id` — публичная детальная карточка (ID или slug, только опубликованные).
- `POST /api/listings` — создание объявления (автор/дилер), статус `DRAFT`.
- `PUT /api/listings/:id` — редактирование (владелец, дилер или модератор).
- `DELETE /api/listings/:id` — удаление (владелец, дилер или модератор).
- `POST /api/listings/:id/submit` — отправка на модерацию (меняет статус на `PENDING`).
- `POST /api/listings/:id/publish` — публикация (только moderator/admin, статус `PUBLISHED`).
- `POST /api/listings/:id/reject` — отклонение с причиной (только moderator/admin, статус `REJECTED`).
- `POST /api/listings/:id/promotions` — применить продвижение (VIP/TOP/Highlight/Autobump) с перерасчётом `boostScore`.

## Специалисты

- `GET /api/specialists` — публичный каталог операторов с фильтрами (`categoryId`, `cityId`, `skill`, `rateFrom/rateTo`, `experience`, `availability`, `hasEquipment`) и сортировками (`rating_desc`, `experience_desc`, `price_asc`, `reviews_desc`). Возвращает пагинацию и фасеты по категориям.
- `GET /api/specialists/:id` — карточка специалиста с портфолио и рейтингом.
- `POST /api/specialists` — создание профиля (авторизованный пользователь).
- `PUT /api/specialists/:id` — редактирование профиля (владелец или модератор/админ).
- `DELETE /api/specialists/:id` — удаление профиля (владелец или модератор/админ).

## Медиа

- `POST /api/media/presign` — получение presigned URL для загрузки в MinIO (валидация формата и размера).
- `POST /api/media/attach` — привязка загруженного файла к объявлению или специалисту с записью в таблицу `media`.

## Чат

- `GET /api/conversations` — список диалогов текущего пользователя (фильтры по listingId/specialistId).
- `GET /api/conversations/:id/messages` — сообщения конкретного диалога (cursor + limit, направление).
- `POST /api/conversations/:id/messages` — отправка сообщения (REST).
- WebSocket `/ws/chat` события:
  - `joinConversation` — подписка на комнату диалога.
  - `sendMessage` — отправка сообщения; сервер рассылает `message` всем участникам.

## Поиск (BFF stub)

- `GET /api/search/listings` — проксирует фасетный поиск по базе (SSR/ISR пока без OpenSearch), возвращает структуру, совместимую с будущим поисковым индексом.
