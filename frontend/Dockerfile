# Usa la imagen oficial de Nginx como base
FROM nginx:alpine

# Elimina archivos predeterminados de Nginx para evitar conflictos
RUN rm -rf /usr/share/nginx/html/*

# Copia únicamente los archivos necesarios del frontend al contenedor
COPY ./index.html /usr/share/nginx/html/
COPY ./styles.css /usr/share/nginx/html/
COPY ./script.js /usr/share/nginx/html/

# Expone el puerto en el que corre el servidor web
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
