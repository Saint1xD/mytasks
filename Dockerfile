FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Ensure the public/avatars directory exists and has correct permissions
RUN mkdir -p /app/public/avatars && chmod 777 /app/public/avatars

EXPOSE 3000

CMD ["npm", "start"]
