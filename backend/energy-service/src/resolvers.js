import { Consommation } from './models/Consommation.js';

export const resolvers = {
    Query: {
        // 1. Historique pour tableaux/courbes
        getHistorique: async (_, { quartier, ressource }) => {
            const filtre = { quartier };
            if (ressource) filtre.typeRessource = ressource;
            return await Consommation.find(filtre).sort({ timestamp: -1 });
        },

        // 2. Comparaison pour Diagrammes en barres
        comparerQuartiers: async (_, { quartier1, quartier2 }) => {
            const getTotal = async (q) => {
                const result = await Consommation.aggregate([
                    { $match: { quartier: q } },
                    { $group: { _id: null, total: { $sum: "$valeur" } } }
                ]);
                return result[0]?.total || 0;
            };

            const total1 = await getTotal(quartier1);
            const total2 = await getTotal(quartier2);
            const diff = Math.abs(total1 - total2);

            let message = "Consommation identique.";
            if (total1 > total2) message = `${quartier1} consomme plus (+${diff.toFixed(2)})`;
            else if (total2 > total1) message = `${quartier2} consomme plus (+${diff.toFixed(2)})`;

            return {
                quartier1,
                total1,
                quartier2,
                total2,
                difference: parseFloat(diff.toFixed(2)),
                message
            };
        },

        // 3. Liste des quartiers pour le <select>
        getQuartiers: async () => {
            // Récupère les noms uniques de quartiers
            return await Consommation.distinct('quartier');
        }
    },

    Mutation: {
        ajouterMesure: async (_, { quartier, ressource, valeur }) => {
            const nouvelleMesure = new Consommation({
                quartier,
                typeRessource: ressource,
                valeur
            });
            return await nouvelleMesure.save();
        }
    }
};