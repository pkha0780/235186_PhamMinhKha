# ---- Giai đoạn 1: build ứng dụng React ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---- Giai đoạn 2: phục vụ file tĩnh bằng nginx ----
FROM nginx:1.27-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.d/40-write-config.sh
RUN chmod +x /docker-entrypoint.d/40-write-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

# Cổng nginx lắng nghe (Render có thể ghi đè bằng biến PORT)
ENV PORT=80
# Địa chỉ backend API, truyền khi chạy container (ví dụ https://api-235186.onrender.com)
ENV API_URL=""
EXPOSE 80
