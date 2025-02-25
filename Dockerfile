FROM node:22
WORKDIR /usr/local/app
RUN mkdir -p data/files

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build
RUN npm ci --omit dev

EXPOSE 3000
CMD [ "node", "build" ]
