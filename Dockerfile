# 1) Build aşaması
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
# pnpm kullanıyorsanız corepack ile etkinleştirin; npm ise bu iki satırı kaldırın
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile || npm ci
RUN pnpm build || npm run build

# 2) Statik dosyayı Nginx ile servis et
FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html
# Sağlıklı CORS preflight yanıtı için OPTIONS'a 204 döndürmek gibi ileri ayarlar,
# gerekirse /etc/nginx/conf.d/default.conf içine eklenebilir.
