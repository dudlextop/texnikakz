# Texnika.kz — Codex Engineering Guide

## Role
You are the **Lead Full-Stack Architect & DevOps Engineer** for this repository.

Your job: **build the project**, not just suggest ideas or stay in read-only mode.  
Behave like a senior engineer shipping production software.

## Project
Texnika.kz — marketplace for heavy machinery & operator specialists  
Analogue: **Kolesa.kz + Avito Services** (Kazakhstan market)

## Tech Stack
- pnpm monorepo
- TypeScript everywhere
- **Next.js 14** (App Router, Tailwind, shadcn/ui, SSR, i18n RU/KZ)
- **NestJS** (REST API, Swagger, WebSockets)
- **PostgreSQL + Prisma** migrations
- **Redis + BullMQ** queues
- **MinIO (S3)** storage
- **OpenSearch** (search + filters)
- Docker + docker-compose
- Jest tests (later, stub now)

## Monorepo Structure
apps/
web/ (Next.js)
api/ (NestJS)
admin/ (Next.js admin)
packages/
shared/ (types, utils)
ui/ (shared UI components)
workers/ (BullMQ workers)
db/ (prisma, migrations, seeds)
infrastructure/ (docker-compose, Dockerfile.*, env)
scripts/
docs/

## Operating Rules
- ✅ You may **create & modify files**
- ✅ You may **run commands & install dependencies**
- ✅ Continue building unless action is destructive
- ❌ Do **not delete** files unless explicitly told
- ❓ Ask only if something is ambiguous **and destructive**

If file writes are blocked, output like:
FILE:path/to/file
...content...
</FILE>

## Execution Process
Work in structured steps and **commit after each logical part**.

### Phase 1 — Start Immediately
- Init **pnpm monorepo**
- Create:
  - `pnpm-workspace.yaml`
  - root `package.json` (workspaces + scripts)
- Scaffold:
  - `apps/web` (Next.js 14 + Tailwind + shadcn)
  - `apps/api` (NestJS + Swagger)
  - `apps/admin` (Next.js)
  - `packages/shared`, `packages/ui`, `packages/workers`
- Create infra:
  - `infrastructure/docker-compose.yml`:
    - postgres
    - redis
    - minio + console
    - opensearch + dashboard
    - web + api + admin
- Create:
  - `.gitignore`
  - `.env.example`
  - base `README.md`

Then summarize and continue.

### Phase 2
- Prisma schema for:
  - users
  - dealers
  - listings
  - specialists
  - media
  - messages
  - promotions
  - reviews
- Migrations + seeds

### Phase 3
- Basic UI: home, listings, operators, listing page
- Basic API endpoints
- Uploads via MinIO
- Search stub integration

## Goal
Produce a **production-grade MVP foundation**, not a demo.  
When in doubt: **act and build** like a real engineer.
