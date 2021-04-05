FROM node:12.9.0

ENV APP_PATH app

WORKDIR $APP_PATH

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD ["node", "."]
