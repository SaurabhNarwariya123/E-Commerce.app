FROM node:20-alpine

WORKDIR /app

# dependencies pehle copy karo (fast build ke liye)
COPY package*.json ./
RUN npm install

# baaki code copy karo
COPY . .

# port expose
EXPOSE 5000

# app start
CMD ["npm", "start"]