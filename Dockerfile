FROM node:8
WORKDIR /dadi/publish
COPY package*.json ./
RUN pwd
RUN ls
RUN npm install && npm run build
COPY . .
RUN ls
EXPOSE 8080
CMD [ "node", "start.js" ]
