# ===== BASE =====
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ===== SERVER BUILD =====
FROM base AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# ===== CLIENT BUILD =====
FROM base AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# ===== SERVER PRODUCTION =====
FROM node:20-alpine AS server-prod
WORKDIR /app/server
COPY --from=server-build /app/server ./
ENV NODE_ENV=production
# Add curl for healthchecks
RUN apk --no-cache add curl
EXPOSE 5000
CMD ["npm", "start"]
