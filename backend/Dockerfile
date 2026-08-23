FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . . 
RUN cd src/db/prisma && npx prisma generate
RUN  npm run build


# apply migrations first, then start the server. without this the db has no tables on a fresh install
CMD ["sh", "-c", "cd src/db && npx prisma migrate deploy && cd /app && npm run start"]