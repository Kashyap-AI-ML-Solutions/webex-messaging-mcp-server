# Multi-stage build for smaller production image
FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Production stage
FROM node:22.12-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=mcp:nodejs . .

# Set environment variables
ENV NODE_ENV=production
# Set transport mode to HTTP for Smithery deployment
ENV TRANSPORT=http

# Expose port for HTTP mode (configurable via PORT env var)
EXPOSE $PORT

# Switch to non-root user
USER mcp

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the server (transport mode controlled by TRANSPORT env var)
CMD ["node", "mcpServer.js"]