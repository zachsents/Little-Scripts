FROM node:18

WORKDIR /little-script
COPY . .
RUN npm install

EXPOSE 5050
ENTRYPOINT [ "node", "." ]