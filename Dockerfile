# 1) Build aşaması
FROM node:20-alpine AS build
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# 2) Statik dosyayı Nginx ile servis et
FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html
# Sağlıklı CORS preflight yanıtı için OPTIONS'a 204 döndürmek gibi ileri ayarlar,
# gerekirse /etc/nginx/conf.d/default.conf içine eklenebilir.
