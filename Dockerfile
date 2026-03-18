# JobFlow Frontend Dockerfile
# Author: Ahmed Adel Bakr Alderai

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV HOSTNAME='0.0.0.0'
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
