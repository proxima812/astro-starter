# Proxima Starter Operations

## Что это

Репозиторий одновременно является:

- исходником стартера
- npm/bunx CLI пакетом `proxima-starter`
- шаблоном технической SEO-базы для Astro проектов

## Команды CLI

```bash
bunx proxima-starter@latest init
bunx proxima-starter@latest add llms ai indexNow manifest
bunx proxima-starter@latest remove llms ai
bunx proxima-starter@latest status
bunx proxima-starter@latest update
bunx proxima-starter@latest update llms ai
```

## Поведение команд

### `init`

- создаёт минимальный Astro проект, если его ещё нет
- копирует базу стартера
- не копирует опциональные integrations и служебные папки
- синхронизирует `tsconfig.json`
- мерджит зависимости и scripts
- запускает `bun update`

### `add`

- добавляет только указанные фичи
- включает соответствующие feature-флаги в `main.config.ts`
- патчит `astro.config.mjs`
- запускает `bun update`

### `update`

- безопасно обновляет только управляемые инфраструктурные файлы
- синхронизирует `tsconfig.json` с alias-ами стартера
- частично синхронизирует `astro.config.mjs`, а не перезаписывает его целиком
- подтягивает файлы уже включённых фич
- может одновременно включить новые фичи, если они переданы аргументами
- запускает `bun update`

### `remove`

- отключает optional feature flags
- удаляет feature-файлы
- пересобирает managed-блоки в `astro.config.mjs`
- применяет feature-specific cleanup rules для managed файлов
- запускает `bun update`

### `status` / `list`

- показывает, какие optional features включены
- показывает, сколько managed files фичи реально присутствует в проекте
- полезно перед `update` и перед ручными миграциями

## Управляемые файлы

`update` рассчитан на обновление только технического слоя.

Сейчас managed set такой:

- `.gitignore`
- `.vscode/*`
- `.lighthouserc.json`
- managed-блоки `astro.config.mjs`
- `scripts/generate-favicons.mjs`
- `src/components/SEO/*`
- `src/integrations/robotsTxt.ts`
- `tsconfig.json`

В `astro.config.mjs` managed считаются:

- import `config`
- import `robotsTxt`
- `// proxima:feature-imports`
- `const optionalIntegrations = [...]`
- `robotsTxt()` и `...optionalIntegrations` внутри `integrations`

## Опциональные фичи

- `llms` -> `src/integrations/llmsTxt.ts`
- `ai` -> `src/integrations/aiTxt.ts`
- `indexNow` -> `src/integrations/indexNow.ts`
- `manifest` -> `src/pages/site.webmanifest.ts`

Флаги живут в `main.config.ts`:

```ts
features: {
  manifest: false,
  ai: false,
  llms: false,
  indexNow: false,
}
```

## Что менять при развитии стартера

Если добавляется новая базовая инфраструктура:

1. Обновить исходные файлы стартера
2. Обновить `bin/proxima-starter.mjs`
3. Если это часть базового слоя, включить файл в `baseEntries` и при необходимости в `managedUpdateEntries`
4. Если это новая optional feature, добавить её в `features`
5. Если нужны новые пакеты или scripts, обновить `scaffold/package-template.json`
6. Обновить `README.md`, `AGENTS.md` и `.agents/*`
7. Прогнать `bun run check`
8. Проверить `init`, `add`, `remove` и `update` в чистой временной папке

## Как добавлять новую optional feature

Пакет подготовлен под расширение через единый registry: `bin/feature-registry.mjs`.

Минимальный шаблон:

```js
newfeature: {
  cliName: "newFeature",
  description: "Short one-line explanation of the feature",
  configFlag: "newFeature",
  files: ["src/integrations/newFeature.ts"],
  astroConfig: {
    importLine: 'import newFeature from "./src/integrations/newFeature";',
    integrationLines: ["\tnewFeature(),"],
  },
  managedCleanup: [
    {
      file: "src/components/SEO/SEO.astro",
      find: '<link rel="alternate" href="/new-feature.txt" />\n',
      replace: "",
    },
  ],
}
```

Дальше:

1. Добавить файлы новой фичи
2. Добавить запись в `FEATURE_REGISTRY`
3. Добавить flag в `main.config.ts`, если нужна особая конфигурация beyond boolean toggle
4. Обновить `scaffold/package-template.json`, если появились новые пакеты
5. Обновить README и docs
6. Если есть legacy или removable snippets в managed файлах, описать их в `managedCleanup`
7. При желании свериться с `bin/feature-template.example.mjs`
8. Прогнать `bun run smoke:cli`

## Проверка перед публикацией

Минимальный чек-лист:

1. `bun run check`
2. `bun run smoke:cli`
3. `bun ./bin/proxima-starter.mjs --help`
4. `bun ./bin/proxima-starter.mjs init` в пустой временной директории
5. `bun ./bin/proxima-starter.mjs add llms ai indexNow manifest`
6. `bun ./bin/proxima-starter.mjs remove llms`
7. `bun ./bin/proxima-starter.mjs update`
8. `bun run check` внутри сгенерированного проекта
9. `bun run pack:dry`
10. `bun run release:dry`

## Публикация

1. Поднять версию в `package.json`
2. Выбрать bump по semver:
   - patch для фиксов и безопасных внутренних улучшений
   - minor для новых features и нового функционала CLI без breaking changes
   - major для breaking changes в workflow или контракте
3. Прогнать `bun run release:check`
4. Убедиться, что `bin/proxima-starter.mjs` executable
5. Выполнить `bun run release:dry`
6. Для полного semantic-release нужны валидные `NPM_TOKEN` и `GH_TOKEN`/`GITHUB_TOKEN`
7. Выполнить `bun run release` или `npm publish`/`bun publish` по вашему процессу
8. Проверить `bunx proxima-starter@latest --help`
