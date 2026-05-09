FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies and all source code (including your .env file)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Standalone Next.js output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma files required at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# FIX 1: Copy the Prisma CLI so 'npx prisma' doesn't download it on every container startup
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# FIX 2: Copy the .env file into the final container so Prisma can read your DATABASE_URL
# Note: If you ever deploy this image to the public, be careful, as baking secrets into the image isn't recommended for strict production environments.
COPY --from=builder /app/.env ./.env

EXPOSE 3000

# Apply migrations safely before app startup
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
