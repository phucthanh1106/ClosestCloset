FROM node:24-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . . 

ENV PORT=4000
EXPOSE 4000

ENV NODE_ENV=production

CMD ["npm", "run", "dev"]