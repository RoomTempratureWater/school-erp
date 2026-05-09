FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies and source code
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

# Install the Prisma CLI directly into the final image.
# This runs on your machine during the build, meaning the executable is 
# baked in and requires NO internet access when deployed to the offline server.
RUN npm install prisma

# Standalone Next.js output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy your Prisma schema folder (required to know WHAT to migrate)
COPY --from=builder /app/prisma ./prisma

# THE PRISMA 7 FIX: Copy the config file so the runner knows where the database is!
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# The container now has 'prisma' installed locally, so npx will find it instantly
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
