FROM node:18-slim

# required for Puppeteer
RUN apt update
RUN apt install -y libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

WORKDIR /user-script
COPY ./user-script .

# need to switch to node user to install dependencies
# so everything is in the right place
RUN mkdir node_modules
RUN chmod -R o+rw package.json package-lock.json node_modules
USER node
RUN npm install

USER root
WORKDIR /server
COPY ./server .
RUN npm install

EXPOSE 5050
ENTRYPOINT [ "node", "." ]