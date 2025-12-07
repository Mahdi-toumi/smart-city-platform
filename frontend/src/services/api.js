import axios from 'axios';

// L'URL unique de ta Gateway
const API_URL = 'http://localhost:8080';




const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si le serveur renvoie une erreur 500 (Internal Server Error)
        if (error.response && error.response.status >= 500) {
            // On redirige vers la page 500
            window.location.href = '/500';
        }
        return Promise.reject(error);
    }
);

// Intercepteur : Ajoute le Token automatiquement à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;