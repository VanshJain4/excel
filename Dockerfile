# Use Node.js 18
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY auth-interface/package*.json ./auth-interface/
COPY auth-backend/package*.json ./auth-backend/

# Install dependencies
RUN npm install
RUN cd auth-interface && npm install
RUN cd auth-backend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd auth-interface && npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE $PORT

# Start the Railway app
CMD ["node", "railway-start.js"]
