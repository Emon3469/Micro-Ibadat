FROM node:20-slim

WORKDIR /app

# Install build essentials just in case, though bcryptjs doesn't need them
# RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY ecosystem.config.cjs ./

EXPOSE 5000

# Use local pm2-runtime from node_modules
CMD ["./node_modules/.bin/pm2-runtime", "ecosystem.config.cjs"]
