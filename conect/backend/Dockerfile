FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY .env.example ./.env.example

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["npm", "start"]
