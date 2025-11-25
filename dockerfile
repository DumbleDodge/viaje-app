# ETAPA 1: Construcción (Build)
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine as production-stage
# Copiamos lo que construimos en la etapa 1 a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copiamos nuestra configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]