FROM node:22
WORKDIR /usr/local/app
RUN mkdir -p data/files

COPY package*.json ./
RUN npm ci --omit dev

COPY . .
RUN npm run build

EXPOSE 3000
CMD [ "node", "build" ]
