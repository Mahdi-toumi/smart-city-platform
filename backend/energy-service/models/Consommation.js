import mongoose from 'mongoose';

const consommationSchema = new mongoose.Schema({
    quartier: { type: String, required: true },
    typeRessource: {
        type: String,
        enum: ['ELECTRICITE', 'EAU', 'GAZ'],
        required: true
    },
    valeur: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Consommation = mongoose.model('Consommation', consommationSchema);