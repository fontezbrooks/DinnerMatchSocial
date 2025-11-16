FROM node:18-alpine

WORKDIR /app

# Install global dependencies
RUN npm install -g @expo/cli@latest

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Expose ports for Expo
EXPOSE 8081 19000 19001 19002

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expo -u 1001
USER expo

# Start Expo development server
CMD ["expo", "start", "--tunnel"]