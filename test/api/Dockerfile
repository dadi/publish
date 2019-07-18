FROM node:8
WORKDIR /dadi/api
COPY package*.json ./
RUN pwd
RUN ls
RUN npm install
COPY . .
RUN ls
EXPOSE 8081
CMD [ "npm", "start" ]
