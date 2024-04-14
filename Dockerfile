FROM node:alpine

WORKDIR ./

COPY package.json ./

RUN yarn install

COPY . .

RUN npx prisma generate

CMD ["node", "./src/main.mjs"]
