FROM node:20-alpine

RUN apk update && apk add --no-cache python3 openjdk17 g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5003
CMD ["node", "index.js"]

