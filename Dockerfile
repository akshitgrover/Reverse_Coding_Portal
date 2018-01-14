FROM node:alpine

WORKDIR /app

ADD package.json /app

RUN npm install

RUN npm install -g sails

ADD /assets /app

ADD . /app

VOLUME /uploads

ENV NODE_ENV production

EXPOSE 1337

CMD ["sails","lift"]