# Project Instructions

## Context

Этот репозиторий снова рассматривается как обычный Astro starter, без отдельного CLI-пакета и publish-flow.

## Editing guardrails

- Без явного запроса не перезаписывать `src/pages/index.astro`
- Не затирать брендовые assets в `public/`
- Не переписывать пользовательские SEO-значения в `main.config.ts`
- При правках инфраструктуры сохранять starter простым, без лишнего генераторного слоя

## Optional features

В репозитории есть опциональные фичи, которые включаются через `config.features` в `main.config.ts`:

- `llms`
- `ai`
- `indexNow`
- `manifest`

Если добавляется новая optional feature:

1. Добавить исходные файлы
2. Обновить feature flags в `main.config.ts`, если нужно
3. Подключить её напрямую в `astro.config.mjs` или связанных компонентах
4. Обновить `README.md`, `AGENTS.md` и `.agents/*`, если поменялся workflow
5. Проверить минимум `bun run check`
