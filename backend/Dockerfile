# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (crucial for type-safe queries)
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# --- Production Runtime Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built files and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/entrypoint.sh ./entrypoint.sh

# Ensure entrypoint is executable
RUN chmod +x ./entrypoint.sh

# Expose API port
EXPOSE 5001

# Start via entrypoint script to handle migrations
ENTRYPOINT ["./entrypoint.sh"]
