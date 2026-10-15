FROM node:24-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=true

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]