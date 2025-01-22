# Usa la imagen oficial de Node.js
FROM node:16

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instala las dependencias en modo producción
RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que corre el servidor
EXPOSE 3000

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]
