FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g pm2

COPY src ./src
COPY ecosystem.config.cjs ./

EXPOSE 5000

CMD ["pm2-runtime", "ecosystem.config.cjs"]
