# kopeika-front

Фронтенд Kopeika — Vue 3 + Quasar 2 (Vite), mobile-first.

## Стек

- **Vue 3** + Composition API
- **Quasar 2** (компоненты, layout, mobile-first)
- **Pinia** — стейт
- **Vue Router 5** (history mode)
- **Vite** — сборка
- **TypeScript** + **ESLint** + **Prettier**

## Запуск (Docker, целевая схема разработки вместе с `kopeika-back`)

```bash
# Один раз — общая внешняя сеть для kopeika-back и kopeika-front
docker network create kopeika 2>/dev/null || true

cp .env.example .env
docker compose up -d --build
docker compose logs -f front
```

UI: http://localhost:9000  
API ожидается на http://localhost:8080/api (см. репозиторий `kopeika-back`).

## Локально (быстрее, без Docker)

```bash
npm install
npm run dev
```

Требования: Node.js `>= 22.12` (см. `engines` в `package.json`).

## Сборка production

```bash
docker compose build front --target production
# или
npm run build
```

После `npm run build` артефакты лежат в `dist/spa/` и копируются в production-образ (nginx).

## Структура

```
src/
├── App.vue
├── assets/
├── boot/             # boot-файлы (axios и т.п. — добавим в фазе 0)
├── components/
├── css/
│   ├── app.scss
│   └── quasar.variables.scss
├── layouts/
│   └── MainLayout.vue
├── pages/
├── router/
└── stores/
docker/
└── nginx-spa.conf    # для production-образа
Dockerfile            # multi-stage: development / build / production
compose.yaml         # network: kopeika (external)
```

## Связанные документы

В общей `kopeika/docs/` (директория проекта на хосте, **не часть этого репозитория**):

- `phase-0-spec.md`
- `frontend-handoff.md` — задача и контракт API для UI
- `api-status.md` — что готово на бэке
