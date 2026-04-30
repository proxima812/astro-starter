# Session Hints

## Быстрый контекст для следующей сессии

- Пакет называется `proxima-starter`
- Основной bin: `bin/proxima-starter.mjs`
- Registry optional features: `bin/feature-registry.mjs`
- Example for new features: `bin/feature-template.example.mjs`
- Команды CLI: `init`, `add`, `remove`, `update`
- Команды обзора: `status`, `list`
- `tsconfig.json` считается managed file и должен обновляться из стартера вместе с alias `@/*`
- Optional features: `llms`, `ai`, `indexNow`, `manifest`
- Feature flags лежат в `main.config.ts`
- `astro.config.mjs` в update нужно синхронизировать частично, через proxima-managed markers

## Где искать логику

- CLI и file sync: `bin/proxima-starter.mjs`
- merge зависимостей: `scaffold/package-template.json`
- release scripts and package checks: `package.json`, `.releaserc.json`, `scripts/smoke-cli.mjs`
- optional routes/integrations: `src/integrations/*`, `src/pages/site.webmanifest.ts`
- SEO базовый слой: `src/components/SEO/SEO.astro`

## Что обычно просят дальше

- добавить новую optional feature
- доработать remove flow
- расширять `managedCleanup` для legacy managed snippets
- расширить безопасный `update` flow
- поменять managed file set
- обновить README и инструкции под новый workflow
