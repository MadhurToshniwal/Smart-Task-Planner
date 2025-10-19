FROM node:18-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install root dependencies
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Copy frontend build to backend public directory
WORKDIR /app
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Expose port (Fly.io uses 8080, Render uses 10000)
EXPOSE 8080

# Set working directory to backend
WORKDIR /app/backend

# Start the server
CMD ["node", "server.js"]
