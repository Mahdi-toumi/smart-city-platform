import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // --- LOGIN ---
    const login = async (username, password) => {
        const response = await api.post('/auth/token', { username, password });
        localStorage.setItem('token', response.data.token);
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
    };

    // --- NOUVEAU : REGISTER ---
    const register = async (formData) => {
        // 1. Appel au backend pour créer le compte
        const response = await api.post('/auth/register', formData);

        // 2. Le backend renvoie déjà le token, on connecte l'utilisateur direct !
        localStorage.setItem('token', response.data.token);

        // 3. On récupère ses infos
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);