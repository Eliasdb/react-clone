
# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Install a simple static file server (such as serve) to serve the build
RUN npm install -g serve

# Expose port 9900
EXPOSE 9900

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "9900"]
