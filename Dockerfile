FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package manifests first for better cache
COPY sone/package*.json ./

# Install dependencies (inside container, no node_modules copied from host)
RUN npm ci

# Copy project source (everything under sone/, but .dockerignore will exclude node_modules, dist, etc.)
COPY sone/ ./

# Build TypeScript (assumes "build" script compiles to dist/)
RUN npm run build

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
