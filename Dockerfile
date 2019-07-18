FROM node:8
WORKDIR /dadi/publish
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD [ "node", "start.js" ]
