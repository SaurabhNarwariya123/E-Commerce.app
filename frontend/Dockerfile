FROM node:20-alpine
# Yeh base image hai (Node.js 18 + lightweight Alpine Linux)

WORKDIR /app
# Container ke andar working folder `/app` set ho gaya

COPY . .
#  Tumhara pura project (current folder) container ke `/app` me copy ho gaya

RUN npm install
#  Project ke saare dependencies install ho gaye (package.json se)

RUN npm run build
#  Production build create ho gaya (React/Vite → dist folder banega)

RUN npm install -g serve
# `serve` package globally install hua (static files run karne ke liye)

EXPOSE 3000
# Container batata hai ki app port 3000 pe chalega

CMD ["serve", "-s", "dist"]
# Container start hote hi `dist` folder ko serve karega (SPA support ke saath)
