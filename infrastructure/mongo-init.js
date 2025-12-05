// Connexion à la base admin pour créer l'utilisateur
db = db.getSiblingDB('emergency_db');

// Création de l'utilisateur spécifique à ce service
db.createUser({
    user: "emergency_user",
    pwd: "emergency1922",
    roles: [
        { role: "readWrite", db: "emergency_db" }
    ]
});

// Création d'une collection pour forcer la création de la DB
db.createCollection('urgences');
print(" Base MongoDB emergency_db et utilisateur créés.");