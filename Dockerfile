# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Sadece manifest/lock dosyaları (cache verimli olsun)
COPY package.json pnpm-lock.yaml* ./

# pnpm'i kur ve kilide göre kurulum yap
RUN npm i -g pnpm@9.12.0
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Şimdi kaynak kodu kopyala (node_modules .dockerignore sayesinde gelmez)
COPY . .

# Build
RUN pnpm build

# ---- runtime stage ----
FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html
