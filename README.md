# kopeika-front

Фронтенд **Kopeika** — UI личного финансового планирования: safe-to-spend, обязательства и платежи, доходы-якоря, календарь, check-in, цели, накопления, web-push напоминания.

Стек: Vue 3 + Quasar 2 (Vite) + Pinia + PWA, mobile-first.

Бэкенд: [kopeika-back](https://github.com/hopelessness-7/kopeika-back).

Лицензия: [MIT](LICENSE) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

## Стек

- **Vue 3** + Composition API (`<script setup>`)
- **Quasar 2** (компоненты, layout, язык `ru`)
- **Pinia** — стейт
- **Vue Router 5** (history mode)
- **Vite** — сборка
- **PWA** — Workbox InjectManifest, Web Push
- **ESLint** + **Prettier**

## Адаптив и темы

- **≤1023px** — мобильная вёрстка: нижняя навигация, контент до 420px
- **≥1024px** — десктоп: боковая панель, шире контент (560–960px), календарь в две колонки
- **Темы** (Настройки → Оформление): светлая / системная / тёмная, сохраняется в `localStorage` (`kopeika_theme`)

## Запуск (Docker, вместе с `kopeika-back`)

```bash
# Один раз — общая внешняя сеть для kopeika-back и kopeika-front
docker network create kopeika 2>/dev/null || true

cp .env.example .env
docker compose up -d --build
docker compose logs -f front
```

UI: http://localhost:9000  
API ожидается на http://localhost:8080/api (см. репозиторий `kopeika-back`).

При старте контейнер делает `npm ci` в named volume `front_node_modules` (нужен для PWA/workbox). После смены зависимостей достаточно `docker compose restart front`; если volume совсем битый: `docker compose down -v && docker compose up -d`.

## Локально (без Docker)

```bash
npm ci
npm run dev
```

Требования: Node.js `^22.12`, `^24`, `^26` или `^28` (см. `engines` в `package.json`). Образ и CI используют Node 24.

Переменные — в `.env` (шаблон `.env.example`): `VITE_API_URL`, `VITE_USE_MOCKS`, `VITE_VAPID_PUBLIC_KEY` (только публичный ключ).

## Сборка production

```bash
docker compose build front --target production
# или
npm run build
```

После `npm run build` артефакты лежат в `dist/pwa/` и копируются в production-образ (nginx).

## CI

GitHub Actions (`.github/workflows/ci.yml`) на push и pull request в `main`: `npm ci`, `npm run lint`, `npm run build` (Node 24).

## Структура

```
src/
├── boot/             # theme, axios, auth
├── components/
├── css/
├── layouts/
├── pages/
├── router/
├── services/
└── stores/
src-pwa/              # manifest, service worker
docker/
└── nginx-spa.conf    # для production-образа
Dockerfile            # multi-stage: development / build / production
compose.yaml          # network: kopeika (external)
```

## Связанные документы

В общей `kopeika/docs/` (директория проекта на хосте, **не часть этого репозитория**):

- `STATUS.md` — актуальный статус продукта / API
- `frontend-handoff.md` — handoff для UI
- `api-status.md` — что готово на бэке
