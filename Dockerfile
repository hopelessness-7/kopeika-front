# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# ------- DEVELOPMENT -------
# В dev /app затирается bind-mount'ом из compose.yaml,
# а node_modules живёт в named volume — поэтому при старте
# entrypoint делает npm install (иначе после добавления workbox и т.п.
# InjectManifest SW падает с "Could not resolve").
# quasar prepare выполнит сам `quasar dev` при старте.
FROM base AS development
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts
COPY docker/dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh
COPY . .
EXPOSE 9000
ENTRYPOINT ["dev-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "9000"]

# ------- BUILD -------
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx quasar prepare
RUN npm run build

# ------- PRODUCTION -------
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist/pwa /usr/share/nginx/html
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
