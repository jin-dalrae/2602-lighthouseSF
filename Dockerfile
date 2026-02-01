# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API key as build argument
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (Vite will read GEMINI_API_KEY from env)
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects PORT 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
