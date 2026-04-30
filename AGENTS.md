# Project Instructions

## Context

Этот репозиторий поддерживает два сценария одновременно:

- исходники Astro стартера
- CLI пакет `proxima-starter` для `bunx`

Любые изменения в базовой инфраструктуре нужно оценивать с двух сторон:

- как это влияет на сам репозиторий
- как это влияет на `init`, `add` и `update` в сгенерированных проектах

## CLI contract

Поддерживаемые команды:

- `init`
- `add`
- `remove`
- `status`
- `update`

`init` создаёт minimal Astro и накатывает starter.

`add` подключает optional features: `llms`, `ai`, `indexNow`, `manifest`.

`remove` отключает optional features и удаляет их managed файлы из проекта.

`status` показывает включённые фичи и наличие их managed файлов в проекте.

`update` обновляет только managed infrastructure files и уже включённые фичи, не должен без необходимости затирать пользовательский контент.

## Managed files

`update` может безопасно перезаписывать:

- `tsconfig.json`
- managed-блоки в `astro.config.mjs`, а не весь файл целиком
- `scripts/generate-favicons.mjs`
- `.gitignore`
- `.vscode/*`
- `.lighthouserc.json`
- `src/components/SEO/*`
- `src/integrations/robotsTxt.ts`
- файлы включённых optional features

## Do not overwrite casually

Без явного запроса не перезаписывать в update-потоке:

- `src/pages/index.astro`
- контентные страницы
- брендовые assets в `public/`
- пользовательские SEO значения в `main.config.ts`

## When changing features

Если добавляется новая optional feature:

1. Добавить исходные файлы
2. Зарегистрировать feature в `bin/feature-registry.mjs`
3. При необходимости обновить `main.config.ts` flags
4. Если нужны cleanup-правила для managed файлов, описать `managedCleanup`
5. Если нужны пакеты, обновить `scaffold/package-template.json`
6. Обновить `README.md` и `docs/proxima-starter.md`
7. Проверить `init`, `add`, `remove`, `status`, `update` end-to-end
8. Желательно прогнать `bun run smoke:cli`
