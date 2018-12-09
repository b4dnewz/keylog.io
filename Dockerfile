FROM node:8-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm link --only=production

EXPOSE 3000

CMD [ "npm", "start" ]
