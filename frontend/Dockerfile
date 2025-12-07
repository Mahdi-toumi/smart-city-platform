# --- Étape 1 : Construction (Build) ---
FROM node:18-alpine as build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Construction de l'application (crée le dossier dist/)
RUN npm run build

# --- Étape 2 : Serveur de Production (Nginx) ---
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape précédente
# Note: Si tu utilises Create-React-App au lieu de Vite, remplace /app/dist par /app/build
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]