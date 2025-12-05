// Simulation de base de données
const actualites = [
    { id: "1", titre: "Inauguration du Parc Central", contenu: "Le parc ouvrira ce samedi...", datePublication: "2024-05-10", auteur: "Mairie de Tunis" },
    { id: "2", titre: "Travaux rue de la Liberté", contenu: "Fermeture prévue pour 3 semaines.", datePublication: "2024-05-12", auteur: "Service Voirie" }
];

const evenements = [
    { id: "1", nom: "Festival de Jazz", date: "2024-07-15", lieu: "Théâtre Municipal", status: "CONFIRME" },
    { id: "2", nom: "Marathon de la Ville", date: "2024-09-01", lieu: "Centre Ville", status: "EN_ATTENTE" },
    { id: "3", nom: "Concert Plein Air", date: "2024-06-20", lieu: "Plage", status: "ANNULE" }
];

const mairies = [
    { id: "1", nom: "Hôtel de Ville Principal", adresse: "Place de la Kasbah", horaires: "08h-17h", telephone: "71 000 000" },
    { id: "2", nom: "Mairie Annexe Nord", adresse: "Cité El Khadra", horaires: "09h-14h", telephone: "71 111 111" }
];

// La logique de réponse
export const resolvers = {
    Query: {
        // Renvoie toutes les actualités
        getActualites: () => actualites,

        // Renvoie les événements (avec filtre optionnel)
        getEvenements: (_, args) => {
            if (args.status) {
                return evenements.filter(evt => evt.status === args.status);
            }
            return evenements;
        },

        // Trouve une mairie par son ID
        getMairie: (_, args) => {
            return mairies.find(m => m.id === args.id);
        }
    }
};