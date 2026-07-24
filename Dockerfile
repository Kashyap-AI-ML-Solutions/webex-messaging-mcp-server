# Multi-stage build for smaller production image
FROM --platform=$BUILDPLATFORM node:22.12-alpine AS builder

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

# Set environment variables (TRANSPORT not set - defaults to STDIO, override at runtime)
ENV NODE_ENV=production \
    LOG_LEVEL=info \
    PORT=3001

# Expose port for HTTP mode
EXPOSE 3001

# Switch to non-root user
USER mcp

# Smart health check that adapts to transport mode
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3001; if ((process.env.TRANSPORT || process.env.MCP_MODE) === 'http') { fetch('http://localhost:' + port + '/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1)); } else { process.exit(0); }"

# Start the server (transport mode controlled by TRANSPORT env var)
CMD ["node", "mcpServer.js"]
