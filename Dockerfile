# Use Node.js 20.18 as the base image
FROM node:20.18-alpine AS builder

# Указываем build-args для переменных окружения
ARG AUTH_SECRET
ARG GCP_BUCKET_NAME
ARG GCP_CLIENT_EMAIL
ARG GCP_PRIVATE_KEY
ARG GCP_PROJECT_ID
ARG MONGODB_URI
ARG NEXTAUTH_SECRET
ARG NODE_ENV=development  # Принудительно установлено для сборки

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install all dependencies, включая devDependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Устанавливаем переменные окружения, чтобы они были доступны на этапе сборки
ENV AUTH_SECRET=$AUTH_SECRET
ENV GCP_BUCKET_NAME=$GCP_BUCKET_NAME
ENV GCP_CLIENT_EMAIL=$GCP_CLIENT_EMAIL
ENV GCP_PRIVATE_KEY=$GCP_PRIVATE_KEY
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID
ENV MONGODB_URI=$MONGODB_URI
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NODE_ENV=$NODE_ENV

# Выполняем сборку проекта
RUN npm run build

# Remove devDependencies after the build to reduce image size
RUN npm prune --production