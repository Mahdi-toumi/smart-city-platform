import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

dotenv.config();

// 1. Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energy_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log(' Connecté à MongoDB (Energy DB)'))
    .catch(err => console.error(' Erreur MongoDB:', err));

// 2. Initialisation Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// 3. Démarrage
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(` Service Energy (GraphQL) prêt à l'adresse : ${url}`);