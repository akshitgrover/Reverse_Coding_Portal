FROM node:alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

VOLUME /app/uploads

EXPOSE 3000

CMD ["node", "server.js"]