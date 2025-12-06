// --- SERVICE URGENCES ---
db = db.getSiblingDB('emergency_db');
db.createUser({
    user: "emergency_user",
    pwd: "emergency1922",
    roles: [{ role: "readWrite", db: "emergency_db" }]
});
db.createCollection('urgences');

// --- NOUVEAU : SERVICE ENERGY ---
db = db.getSiblingDB('energy_db'); // Bascule sur la nouvelle DB
db.createUser({
    user: "energy_user",
    pwd: "energy1922",
    roles: [{ role: "readWrite", db: "energy_db" }]
});
db.createCollection('consommations'); // Force la création

print("Bases MongoDB (Urgences & Energy) configurées.");