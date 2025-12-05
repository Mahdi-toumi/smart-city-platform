import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// Configuration du serveur
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Démarrage du serveur (Port 4000 par défaut pour GraphQL)
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(` Service Citoyen (GraphQL) prêt à l'adresse : ${url}`);