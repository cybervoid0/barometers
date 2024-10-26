# Use Node.js 20.18 as the base image
FROM node:20.18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install all dependencies, including devDependencies, for the build stage
RUN npm install

# Copy the entire project into the container
COPY . .

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

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
