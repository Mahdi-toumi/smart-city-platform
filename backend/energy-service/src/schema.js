export const typeDefs = `#graphql
  
  # Définition des types
  enum TypeRessource {
    ELECTRICITE
    EAU
    GAZ
  }

  type Consommation {
    id: ID!
    quartier: String!
    typeRessource: TypeRessource!
    valeur: Float!
    timestamp: String
  }

  # --- QUERIES (Lecture) ---
  type Query {
    "Récupérer l'historique d'un quartier pour une ressource donnée"
    getHistorique(quartier: String!, ressource: TypeRessource): [Consommation]

    "Comparer la consommation totale de deux quartiers"
    comparerQuartiers(quartier1: String!, quartier2: String!): String
  }

  # --- MUTATIONS (Écriture) ---
  type Mutation {
    "Ajouter un relevé (Simulation capteur)"
    ajouterMesure(quartier: String!, ressource: TypeRessource!, valeur: Float!): Consommation
  }
`;