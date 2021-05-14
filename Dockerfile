FROM node:16

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

VOLUME /app
EXPOSE 3000
CMD ["yarn", "start"]
