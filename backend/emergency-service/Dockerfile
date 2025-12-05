FROM python:3.12-slim

WORKDIR /app

# Copie des requirements et installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY . .

# IMPORTANT : On doit s'assurer que les fichiers générés protobuf sont là
# Dans un CI/CD réel, on les générerait ici, mais pour le dev on copie ceux du local
# (Assure-toi d'avoir lancé la commande protoc avant le build docker)

EXPOSE 50053

CMD ["python", "server.py"]