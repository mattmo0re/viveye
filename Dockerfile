# Multi-stage build for VivEye
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend
COPY --from=frontend-build /app/client/build ./public

# Install Tor
RUN apk add --no-cache tor

# Create directories
RUN mkdir -p /app/tor-data /app/logs

# Expose ports
EXPOSE 5000 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start script
CMD ["node", "index.js"]