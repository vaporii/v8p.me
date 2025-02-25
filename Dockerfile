FROM node:22
RUN mkdir -p /usr/local/app/data/files && chown -R node:node /usr/local/app/data/files
WORKDIR /usr/local/app

COPY package*.json ./
USER node
RUN npm i

COPY --chown=node:node . .
RUN npm run build
RUN npm ci --omit dev

EXPOSE 3000
CMD [ "node", "-r", "dotenv/config", "build" ]
