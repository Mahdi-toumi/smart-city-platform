# Utilisation de Node.js (version LTS Alpine pour la légèreté)
FROM node:18-alpine

WORKDIR /app

# Copie des définitions de dépendances
COPY package.json .

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Port GraphQL
EXPOSE 4001

# Commande de démarrage
CMD ["npm", "start"]