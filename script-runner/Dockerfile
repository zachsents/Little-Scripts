FROM node:20-slim

# Required for Puppeteer
RUN apt update
RUN apt install -y libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 xvfb

# Set up unpriveleged user
RUN groupadd ls-group
RUN useradd -m -g ls-group -u 1001 ls-user

# Set up user script directory
WORKDIR /home/ls-user/script
COPY ./user-script .
RUN chown -R ls-user:ls-group .

# Need to switch to unpriveleged user to install dependencies
# so puppeteer stuff is in the right cache
USER ls-user
RUN npm install

# Now change back and remove write permissions
USER root
RUN chmod -R 500 .

# Copy server files
WORKDIR /server
COPY ./server .
RUN npm install
RUN chmod -R o-rwx .

EXPOSE 5050
ENTRYPOINT [ "node", "." ]