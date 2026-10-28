FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Cài dependencies trước để tận dụng cache của Docker
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Chạy bằng user không có quyền root
USER node

# Cổng mặc định; có thể đổi bằng biến môi trường PORT khi chạy container
ENV PORT=5000
EXPOSE 5000

# MONGODB_URI không được đặt trong image, truyền khi chạy container
CMD ["node", "src/index.js"]
