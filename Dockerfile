# Dockerfile for SAGE-BE (production build)
FROM node:18-alpine

WORKDIR /app

# Install build tools and dependencies
COPY package*.json ./
# Use legacy-peer-deps to avoid ERESOLVE peer dependency conflicts during Docker build
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build && npm prune --production --legacy-peer-deps

EXPOSE 4000
CMD ["node", "dist/main.js"]
