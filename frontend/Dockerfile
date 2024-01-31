FROM node:20-alpine as build
WORKDIR /frontend
COPY package*.json ./
RUN npm cache clean --force
RUN npm install
COPY . .
RUN npm run build
FROM nginx:1.25.3-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /frontend/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]