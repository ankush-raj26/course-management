FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . . 
RUN cd src/db/prisma && npx prisma generate
RUN  npm run build


CMD [ "npm" ,"run", "start" ]