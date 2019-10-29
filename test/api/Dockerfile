FROM node:8
WORKDIR /dadi/api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD [ "npm", "start" ]
