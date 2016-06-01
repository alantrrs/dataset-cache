FROM node:5.11
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
COPY . /app
ENTRYPOINT ["node", "cli.js"]
