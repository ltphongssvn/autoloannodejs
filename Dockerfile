FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]

FROM base AS dev
RUN npm ci
CMD ["npm", "run", "dev"]

FROM base AS test
RUN npm ci
CMD ["npm", "test"]
