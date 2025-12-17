FROM node:18-alpine AS deps

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --include=dev


FROM node:18-alpine AS builder

WORKDIR /app/backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./

RUN npm run build


FROM node:18-alpine AS runner

WORKDIR /app/backend
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/backend/dist ./dist
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]
