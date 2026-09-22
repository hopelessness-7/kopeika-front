# Contributing

Спасибо за интерес к **kopeika-front**. Ниже — минимальный порядок работы.

## Быстрый старт

См. [README.md](README.md): Docker-сеть `kopeika` и API [kopeika-back](https://github.com/hopelessness-7/kopeika-back).

```bash
docker network create kopeika 2>/dev/null || true
cp .env.example .env
docker compose up -d --build
```

Без Docker:

```bash
npm ci
npm run dev
```

Нужен Node.js `^22.12`, `^24`, `^26` или `^28` (в CI — 24, как в `Dockerfile`).

## Ветки и PR

1. Форк или ветка от актуального `main`.
2. Одна тема = один PR (фича / фикс / docs / ci).
3. Сообщения коммитов: conventional style, например `feat(ui): …`, `fix: …`, `docs: …`, `ci: …`.
4. Перед PR: `npm run lint` и `npm run build`.
5. CI на GitHub Actions должен быть зелёным.

## Стиль кода

- Vue 3, Composition API, `<script setup>`.
- Quasar 2, Pinia, Vue Router (history).
- ESLint (`npm run lint`) и Prettier (`npm run format`).
- Не коммить `.env`, приватные ключи и секреты. `VITE_VAPID_PUBLIC_KEY` — только публичный ключ; private key живёт на бэке.

## Вопросы

Открывай GitHub Issue с воспроизведением и ожидаемым поведением. Уязвимости — только по [SECURITY.md](SECURITY.md).
