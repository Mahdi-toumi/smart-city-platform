import os
from pymongo import MongoClient
import logging

# Configuration via Variables d'Environnement (Docker)
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")
MONGO_USER = os.getenv("MONGO_USER", "emergency_user")
MONGO_PASS = os.getenv("MONGO_PASS", "emergency1922")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "emergency_db")

# URI de connexion sécurisée
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB_NAME}?authSource={MONGO_DB_NAME}"

try:
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection_urgences = db["urgences"]
    # Test de connexion
    client.server_info()
    logging.info(f" Connecté à MongoDB: {MONGO_DB_NAME}")
except Exception as e:
    logging.error(f" Erreur connexion MongoDB: {e}")
    # En prod, on pourrait lever une exception bloquante ici

def get_collection():
    return collection_urgences