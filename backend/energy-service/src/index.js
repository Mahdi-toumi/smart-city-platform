import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// URL depuis Docker Compose ou Local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energy_db';

console.log("🔌 Tentative de connexion MongoDB...");

mongoose.connect(MONGO_URI)
    .then(() => console.log(' Connecté à MongoDB (Energy DB)'))
    .catch(err => console.error(' Erreur MongoDB:', err));

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    cors: false
});

console.log(` Service Energy (GraphQL) prêt à l'adresse : ${url}`);