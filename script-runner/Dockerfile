FROM node:19-alpine

WORKDIR /little-script
COPY . .
RUN npm install

EXPOSE 5050
ENTRYPOINT [ "node", "." ]