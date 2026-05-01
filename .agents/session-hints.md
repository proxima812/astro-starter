# Session Hints

## Быстрый контекст для следующей сессии

- Это обычный starter-репозиторий, не CLI-пакет
- `tsconfig.json` держит alias `@/*`
- Optional features: `llms`, `ai`, `indexNow`, `manifest`
- Feature flags лежат в `main.config.ts`
- `astro.config.mjs` подключает optional integrations напрямую по feature flags

## Где искать логику

- optional routes/integrations: `src/integrations/*`, `src/pages/site.webmanifest.ts`
- SEO базовый слой: `src/components/SEO/SEO.astro`

## Что обычно просят дальше

- добавить новую optional feature
- включить или выключить feature flags под конкретный проект
- упростить или усилить SEO-базу
- обновить README и инструкции под новый workflow
