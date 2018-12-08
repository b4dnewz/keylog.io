FROM node:carbon

WORKDIR /usr/src/app

COPY . .

RUN npm link --only=production

EXPOSE 9000

CMD [ "npm", "start" ]
