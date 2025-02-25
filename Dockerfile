FROM node:22

USER node
RUN mkdir -p /home/node/app/data/files && chown -R node:node /home/node/app/data/files
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
RUN npm i

COPY --chown=node:node . .
RUN npm run build
RUN npm ci --omit dev

EXPOSE 3000
CMD [ "node", "-r", "dotenv/config", "build" ]
