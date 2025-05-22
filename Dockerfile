# Base Node.js image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json ./
# Install all dependencies including dev dependencies needed for build
# Using --legacy-peer-deps to handle React version conflicts
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This will run next build and use the standalone output mode as per next.config.ts
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only necessary files for the app to run in standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/build ./build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/build/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/build/static ./build/static
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env

# Expose the port the app will run on
EXPOSE 4000

# Set the environment variables
ENV PORT=4000

# Start the app
CMD ["node", "server.js"] 