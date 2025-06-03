# Usar una imagen base de Node.js (versión LTS Alpine para un tamaño reducido)
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación (según tu .env)
EXPOSE 3000

# Comando para correr la aplicación
CMD ["node", "server.js"]