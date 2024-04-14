FROM node:alpine

WORKDIR ./

COPY package.json ./

RUN yarn install

COPY . .

RUN npx prisma generate

RUN npx prisma db push

CMD ["node", "./src/main.mjs"]
