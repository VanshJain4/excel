# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY auth-interface/package*.json ./auth-interface/

# Install dependencies
RUN cd auth-interface && npm install

# Copy source code
COPY auth-interface/ ./auth-interface/

# Build the app
RUN cd auth-interface && npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/auth-interface/build /usr/share/nginx/html

# Copy nginx config
COPY auth-interface/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
