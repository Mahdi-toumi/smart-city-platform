import mongoose from 'mongoose';
import { Consommation } from './src/models/Consommation.js';

// Connexion (Même URL que index.js)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energy_db';

const seedData = async () => {
    await mongoose.connect(MONGO_URI);
    console.log(" Connexion Seeder établie.");

    // Nettoyage
    await Consommation.deleteMany({});
    console.log(" Anciennes données supprimées.");

    const quartiers = ["Lac 1", "Centre-Ville", "Marsa", "Carthage"];
    const ressources = ["ELECTRICITE", "EAU", "GAZ"];

    const mesures = [];

    // Générer 50 mesures aléatoires
    for (let i = 0; i < 50; i++) {
        const q = quartiers[Math.floor(Math.random() * quartiers.length)];
        const r = ressources[Math.floor(Math.random() * ressources.length)];
        const v = Math.floor(Math.random() * 500) + 50; // Valeur entre 50 et 550

        mesures.push({
            quartier: q,
            typeRessource: r,
            valeur: v,
            timestamp: new Date()
        });
    }

    await Consommation.insertMany(mesures);
    console.log(` ${mesures.length} mesures insérées.`);
    process.exit();
};

seedData();