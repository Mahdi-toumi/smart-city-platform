export const typeDefs = `#graphql
  
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

  # Nouvel objet pour les graphiques Frontend
  type ComparaisonResult {
    quartier1: String!
    total1: Float!
    quartier2: String!
    total2: Float!
    difference: Float!
    message: String!
  }

  type Query {
    "Récupérer l'historique d'un quartier (Tableau de données)"
    getHistorique(quartier: String!, ressource: TypeRessource): [Consommation]

    "Comparer deux quartiers (Pour les graphiques en barres)"
    comparerQuartiers(quartier1: String!, quartier2: String!): ComparaisonResult

    "Liste des quartiers disponibles (Pour le menu déroulant)"
    getQuartiers: [String]
  }

  type Mutation {
    "Ajouter un relevé"
    ajouterMesure(quartier: String!, ressource: TypeRessource!, valeur: Float!): Consommation
  }
`;