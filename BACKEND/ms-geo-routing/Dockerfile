# Usar una imagen base de Node.js (versión LTS Alpine para un tamaño reducido)
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias de producción y desarrollo para construir
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación (si es TypeScript o necesita un paso de build)
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar solo las dependencias de producción desde la etapa de builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto en el que corre la aplicación (según tu .env)
EXPOSE 3004

# Comando para correr la aplicación
CMD ["node", "dist/main"]