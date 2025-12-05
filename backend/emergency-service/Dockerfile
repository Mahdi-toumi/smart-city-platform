# Utilisation d'une image légère de Python 3.9
FROM python:3.9-slim

# Définition du dossier de travail dans le conteneur
WORKDIR /app

# 1. Copie des fichiers de dépendances
COPY requirements.txt .

# 2. Installation des librairies (gRPC, protobuf)
# --no-cache-dir permet de réduire la taille de l'image
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copie de tout le code source (y compris le dossier proto et les fichiers générés)
COPY . .

# Documentation du port (Celui défini dans server.py)
EXPOSE 50053

# Commande de démarrage
CMD ["python", "server.py"]