# Use Node.js 18
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache bash curl

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY auth-interface/package*.json ./auth-interface/
COPY auth-backend/package*.json ./auth-backend/
COPY gpt/package*.json ./gpt/

# Install root dependencies
RUN npm install

# Install auth-interface dependencies and build
WORKDIR /app/auth-interface
RUN npm install
COPY auth-interface/ .
RUN npm run build

# Install auth-backend dependencies
WORKDIR /app/auth-backend
RUN npm install
COPY auth-backend/ .

# Install gpt (WOPI server) dependencies
WORKDIR /app/gpt
RUN npm install
COPY gpt/ .

# Return to root and copy remaining files
WORKDIR /app
COPY . .

# Make scripts executable
RUN chmod +x *.sh

# Expose port
EXPOSE $PORT

# Start the Railway server
CMD ["node", "railway-server.js"]
