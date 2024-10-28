# Use Node.js 20.18 as the base image
FROM node:20.18-alpine AS builder

# Указываем build-args для переменных окружения
ARG GCP_BUCKET_NAME
ARG GCP_PROJECT_ID
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NODE_ENV

# Using secrets
RUN --mount=type=secret,id=AUTH_SECRET \
  --mount=type=secret,id=GCP_CLIENT_EMAIL \
  --mount=type=secret,id=GCP_PRIVATE_KEY \
  --mount=type=secret,id=MONGODB_URI \
  --mount=type=secret,id=NEXTAUTH_SECRET \
  echo "Secrets were successfully received"

# Using arguments
ENV GCP_BUCKET_NAME=$GCP_BUCKET_NAME
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NODE_ENV=$NODE_ENV

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies, including devDependencies, for the build stage
RUN npm install

# Copy the entire project into the container
COPY . .

# Выполняем сборку проекта
RUN npm run build

# Remove devDependencies after the build to reduce image size
RUN npm prune --production

# Start a new stage for the production environment
FROM node:20.18-alpine

# Set the working directory inside the new container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app ./

# Set the environment variable for production
ENV NODE_ENV=production

# Expose port for the application
EXPOSE 8080

# Start the application
CMD ["npm", "start"]