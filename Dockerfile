# Simple reverse proxy to Firebase hosting
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects PORT 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
