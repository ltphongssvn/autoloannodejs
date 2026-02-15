FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000

FROM base AS dev
RUN npm ci
CMD ["npm", "run", "dev"]

FROM base AS test
RUN npm ci
CMD ["npm", "test"]

FROM base AS production
RUN npm ci
CMD ["sh", "-c", "npx sequelize-cli db:migrate --migrations-path src/migrations 2>&1 || true; node src/server.js"]
