FROM node:8
WORKDIR /dadi/publish
COPY package*.json ./
RUN npm install && npm run build
COPY . .
EXPOSE 8080
CMD [ "node", "start.js" ]
