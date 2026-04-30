# Agent Rules

## Основной режим мышления

- Сначала проверять, как изменение скажется на самом стартере
- Затем проверять, как то же изменение скажется на `bunx proxima-starter@latest init`
- Отдельно думать про `add`, `remove` и `update`

## При изменении инфраструктуры

- Если меняется базовый технический слой, проверить `baseEntries` и `managedUpdateEntries` в `bin/proxima-starter.mjs`
- Если меняется optional feature, обновить `FEATURE_REGISTRY` в `bin/feature-registry.mjs`
- Если feature должна очищать legacy snippets из managed файлов, описать `managedCleanup`
- Если меняются пакеты или scripts, обновить `scaffold/package-template.json`
- Если меняется alias или ts-настройки, синхронизировать `tsconfig.json`
- Если меняется `astro.config.mjs`, помнить, что `update` должен мерджить managed-блоки, а не сносить пользовательский файл целиком
- Перед релизом проверять `CHANGELOG.md`, `release:check` и `release:dry`

## При обновлении документации

- Держать в актуальном состоянии `README.md`
- Держать в актуальном состоянии `docs/proxima-starter.md`
- Если меняется workflow сопровождения, обновлять `AGENTS.md` и `.agents/*`

## Проверка

Минимум после нетривиальных правок:

1. `bun run check`
2. `bun ./bin/proxima-starter.mjs --help`
3. smoke test `init` в чистой папке
4. smoke test `add`
5. smoke test `remove`
6. smoke test `status`
7. smoke test `update`
8. по возможности `bun run smoke:cli`
