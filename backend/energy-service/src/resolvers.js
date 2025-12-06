import { Consommation } from '../models/Consommation.js';

export const resolvers = {
    Query: {
        getHistorique: async (_, { quartier, ressource }) => {
            const filtre = { quartier };
            if (ressource) filtre.typeRessource = ressource;

            // Retourne les données triées par date (plus récent d'abord)
            return await Consommation.find(filtre).sort({ timestamp: -1 });
        },

        comparerQuartiers: async (_, { quartier1, quartier2 }) => {
            // Agrégation MongoDB pour calculer la somme totale
            const getTotal = async (q) => {
                const result = await Consommation.aggregate([
                    { $match: { quartier: q } },
                    { $group: { _id: null, total: { $sum: "$valeur" } } }
                ]);
                return result[0]?.total || 0;
            };

            const total1 = await getTotal(quartier1);
            const total2 = await getTotal(quartier2);

            let verdict = "";
            if (total1 > total2) verdict = `${quartier1} consomme plus (${total1} vs ${total2})`;
            else if (total2 > total1) verdict = `${quartier2} consomme plus (${total2} vs ${total1})`;
            else verdict = "Consommation identique.";

            return verdict;
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