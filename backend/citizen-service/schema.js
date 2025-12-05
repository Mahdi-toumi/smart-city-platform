// On utilise la syntaxe SDL (Schema Definition Language)
export const typeDefs = `#graphql
  
  # --- TYPES DE DONNÉES ---

  "Représente une actualité municipale"
  type Actualite {
    id: ID!
    titre: String!
    contenu: String
    datePublication: String
    auteur: String
  }

  "Représente un événement culturel ou sportif"
  type Evenement {
    id: ID!
    nom: String!
    date: String
    lieu: String
    status: StatusEvent # Enum
  }

  "Informations pratiques sur une mairie"
  type Mairie {
    id: ID!
    nom: String!
    adresse: String
    horaires: String
    telephone: String
  }

  enum StatusEvent {
    CONFIRME
    ANNULE
    EN_ATTENTE
  }

  # --- POINT D'ENTRÉE (QUERIES) ---
  
  type Query {
    "Récupérer toutes les actualités"
    getActualites: [Actualite]

    "Récupérer les événements (optionnel : filtrer par status)"
    getEvenements(status: StatusEvent): [Evenement]

    "Récupérer les infos d'une mairie spécifique"
    getMairie(id: ID!): Mairie
  }
`;