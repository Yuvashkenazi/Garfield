FROM node:21.6.2

WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot

VOLUME [ "/usr/src/garfield-data" ]

USER root
RUN mkdir -p /usr/src/garfield-data/config && chmod -R 777 /usr/src/garfield-data/config
RUN mkdir -p /usr/src/garfield-data/logs && chmod -R 777 /usr/src/garfield-data/logs
RUN mkdir -p /usr/src/garfield-data/data && chmod -R 777 /usr/src/garfield-data/data
RUN mkdir -p /usr/src/garfield-data/farside && chmod -R 777 /usr/src/garfield-data/farside
RUN mkdir -p /usr/src/garfield-data/mimamu && chmod -R 777 /usr/src/garfield-data/mimamu

# Build and run
RUN npm run build
CMD ["npm", "start"]
