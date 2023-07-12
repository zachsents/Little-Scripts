FROM node:19-alpine

WORKDIR /user-script
COPY ./user-script .
RUN npm install

WORKDIR /server
COPY ./server .
RUN npm install

EXPOSE 5050
ENTRYPOINT [ "node", "." ]