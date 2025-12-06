import mongoose from 'mongoose';

const consommationSchema = new mongoose.Schema({
    quartier: { type: String, required: true }, // ex: "Lac 1", "Centre-Ville"
    typeRessource: {
        type: String,
        enum: ['ELECTRICITE', 'EAU', 'GAZ'],
        required: true
    },
    valeur: { type: Number, required: true }, // kWh ou m3
    timestamp: { type: Date, default: Date.now }
});

// Création du modèle
export const Consommation = mongoose.model('Consommation', consommationSchema);