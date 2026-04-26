# Astro Starter Latest

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/medium.svg)](https://astro.build)
![Astro](https://img.shields.io/badge/Astro-6.1-black?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-ready-F9F1E1?logo=bun&logoColor=111111)

Готовый Astro starter для быстрых SEO-ориентированных сайтов, лендингов, корпоративных страниц и контентных проектов.
Собран вокруг одной идеи: минимальный старт без мусора, но с сильной базой по индексации, метаданным, AI-ready файлам, favicon, manifest и валидации.

## Что это за стартер

Этот шаблон уже включает:

- Astro 6 со статической сборкой
- Tailwind CSS v4
- TypeScript strict mode
- React integration для island-компонентов
- централизованный SEO-слой
- `robots.txt`, `sitemap`, `llms.txt`, `ai.txt`
- `site.webmanifest`
- favicon pipeline из одного SVG-источника
- подключаемые Google Tag Manager и Yandex Metrika
- Schema.org разметку
- проверку SEO после билда
- Lighthouse CI конфиг
- alias `@/*` для `src/*`

Если коротко: это не просто пустой Astro boilerplate, а стартовая база с уже продуманной технической обвязкой под production.

## Основные плюшки

### 1. SEO по умолчанию

В проекте уже есть полноценный SEO-компонент, который выставляет:

- `title`, `description`, `canonical`
- Open Graph
- Twitter Card
- `robots`
- verification meta tags
- JSON-LD schema через `astro-seo-schema`
- favicon, manifest, theme-color, Apple touch icon

Все основные параметры сайта централизованы в [`main.config.ts`](./main.config.ts).

### 2. AI-ready инфраструктура

Стартер сразу генерирует:

- `/robots.txt`
- `/llms.txt`
- `/ai.txt`

Это полезно для современных поисковых и AI-агентов, которым нужны понятные правила обхода, ссылки на sitemap и карта публичных страниц.

### 3. Автоматический favicon workflow

Кладёшь один файл:

```text
public/favicon-180x180.svg
```

Дальше перед `bun run dev` автоматически один раз генерируются:

- `favicon.svg`
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

Если исходный SVG не менялся, повторной генерации не будет.

### 4. Удобная архитектура под масштабирование

В проекте уже разведены зоны ответственности:

- `layouts` для общего каркаса
- `components` для UI и SEO
- `integrations` для технических route/integration модулей
- `styles` для Tailwind v4 theme layer
- `utils` для helper-функций
- `pages` для роутинга

Это хороший баланс между простотой и готовностью к росту проекта.

### 5. Аналитика без лишней магии

В стартере есть готовые компоненты для:

- Google Tag Manager
- Yandex Metrika

Они подключаются через конфиг и не требуют ручной вставки скриптов по проекту.

### 6. Проверка качества после сборки

Есть готовые команды для:

- type check через Astro
- SEO validation собранного `dist`
- Lighthouse CI

То есть стартер помогает не только быстро стартовать, но и держать техническое качество.

## Стек

- Astro
- TypeScript
- Tailwind CSS v4
- React
- `astro-icon`
- `astro-meta-tags`
- `astro-seo-schema`
- `@astrojs/sitemap`
- `@astrojs/mdx`

## Быстрый старт

```bash
bun install
bun run dev
```

Сборка production:

```bash
bun run build
```

Проверка типов:

```bash
bun run check
```

SEO-проверка после билда:

```bash
bun run check:seo
```

Lighthouse CI:

```bash
bun run lighthouse
```

Ручная генерация favicon:

```bash
bun run generate:favicons
```

## Структура проекта

```text
.
├── astro.config.mjs                  # Astro config, integrations, static output
├── main.config.ts                    # Главный конфиг сайта и SEO
├── package.json                      # Скрипты и зависимости
├── public/
│   ├── apple-touch-icon.png
│   ├── default-ogImage.jpg
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   └── favicon.svg
├── scripts/
│   ├── generate-favicons.mjs         # Генерация favicon из одного SVG
│   └── validate-seo.mjs              # Проверка метаданных в собранном dist
├── src/
│   ├── components/
│   │   ├── partials/
│   │   │   └── Container.astro       # Базовый контейнер layout-слоя
│   │   └── SEO/
│   │       ├── Analytics/
│   │       │   ├── GoogleTagManager.astro
│   │       │   └── YandexMetrika.astro
│   │       └── SEO.astro             # Все meta/link/schema теги
│   ├── integrations/
│   │   ├── aiTxt.ts                  # /ai.txt
│   │   ├── indexNow.ts               # IndexNow submit after build
│   │   ├── llmsTxt.ts                # /llms.txt
│   │   └── robotsTxt.ts              # /robots.txt
│   ├── layouts/
│   │   └── Layout.astro              # Главный layout
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro
│   │   └── site.webmanifest.ts
│   ├── styles/
│   │   └── tailwind.css              # Tailwind v4 theme tokens и base styles
│   ├── utils/
│   │   └── lib/
│   │       └── cn.ts                 # clsx + tailwind-merge helper
│   └── content.config.ts             # Заготовка под content collections
└── tsconfig.json
```

## Что уже настроено в коде

### `astro.config.mjs`

Уже подключены:

- MDX
- React
- Sitemap
- Astro Icon
- Astro Meta Tags
- кастомные integrations для `robots.txt`, `ai.txt`, `llms.txt`, `IndexNow`

Дополнительно:

- `output: "static"`
- `prefetchAll: true`
- `defaultStrategy: "viewport"`
- отключён Astro Dev Toolbar

### `main.config.ts`

Одна точка управления для:

- `site.url`
- язык и locale
- Open Graph defaults
- theme colors
- verification tags
- analytics IDs
- IndexNow key

Это удобно: перенос проекта на другой домен и бренд обычно сводится к правке одного файла.

### `SEO.astro`

Компонент уже умеет:

- собирать корректный `<title>`
- нормализовать canonical URL
- подставлять OG image по умолчанию
- переключать schema между `WebPage` и `BlogPosting`
- добавлять article meta для страниц-статей
- подключать favicon и manifest

## Для каких проектов подходит

- SEO-сайты услуг
- сайты компаний
- личные сайты и портфолио
- лендинги
- контентные проекты и блоги
- сайты, где важны canonical, schema, sitemap и аккуратные метатеги

## Почему этот стартер удобен

- не перегружен лишними абстракциями
- уже закрывает базовые техтребования продакшена
- легко адаптируется под новый бренд и домен
- не заставляет вручную собирать SEO-обвязку
- даёт хороший фундамент под дальнейшую разработку

## Что обычно меняют первым делом

1. Заполняют [`main.config.ts`](./main.config.ts)
2. Меняют контент главной страницы в [`src/pages/index.astro`](./src/pages/index.astro)
3. Кладут свой `public/favicon-180x180.svg`
4. Добавляют OG image и логотип
5. Включают GTM или Metrika при необходимости

## Дальше можно быстро нарастить

- блог на Astro Content Collections
- страницы услуг
- MDX-контент
- формы
- React/Solid/Svelte islands
- каталог, FAQ, knowledge base

## Команды

| Команда | Что делает |
| --- | --- |
| `bun run dev` | запускает локальный dev server |
| `bun run build` | собирает production build |
| `bun run preview` | локально открывает собранный проект |
| `bun run check` | запускает `astro check` |
| `bun run generate:favicons` | вручную генерирует favicon-файлы |
| `bun run validate:seo` | проверяет SEO в `dist` |
| `bun run check:seo` | билдит проект и запускает SEO validator |
| `bun run lighthouse` | гоняет Lighthouse CI |

## Идея стартера

Сделать такой baseline, который можно взять за основу нового проекта и не тратить первые часы на:

- favicon и manifest
- canonical и social meta
- robots и sitemap
- schema markup
- аналитику
- AI/LLM служебные файлы
- SEO smoke-check после сборки

Именно в этом его главная сила.
