FROM node:20-alpine AS build

WORKDIR /app

# Копирование package.json и package-lock.json для установки зависимостей
COPY frontend/package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование всего кода
COPY frontend/ .

# Сборка веб-приложения
RUN npm run build

FROM nginx:alpine

# Удаление дефолтного конфига
RUN rm /etc/nginx/conf.d/default.conf

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранного веб-приложения в nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открытие порта 80
EXPOSE 80

# Запуск nginx на фоне
CMD ["nginx", "-g", "daemon off;"]
