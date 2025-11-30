# Multi-stage build for production
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server code
COPY server/ ./

# Copy built frontend
COPY --from=builder /app/client/build ./public

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]

