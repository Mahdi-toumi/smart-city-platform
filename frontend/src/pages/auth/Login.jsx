import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FaCity, FaUser, FaLock, FaArrowRight,
    FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus
} from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.dismiss();
        const toastId = toast.loading("Authentification en cours...", { icon: <FaSignInAlt /> });

        try {
            await login(username, password);
            toast.dismiss(toastId);
            toast.success("Connexion réussie", { duration: 5000, icon: <FaCity className="text-primary" /> });
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Identifiants incorrects", { duration: 5000 });
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">

            {/* --- COLONNE GAUCHE - FORMULAIRE --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                                <FaCity className="text-white text-xl" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">SMART CITY</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
                        <p className="text-gray-600">Accédez à votre espace de gestion</p>
                    </div>

                    <div onSubmit={handleSubmit}>
                        <div className="space-y-5">

                            {/* Input Username */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Identifiant
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400 text-sm" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                   focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                   transition-all text-gray-900"
                                        placeholder="Entrez votre identifiant"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400 text-sm" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg
                                                   focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                   transition-all text-gray-900"
                                        placeholder="Entrez votre mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <div className="text-right mt-2">
                                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bouton Connexion */}
                        <button
                            onClick={handleSubmit}
                            className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg
                                       font-semibold hover:bg-slate-800 transition-colors
                                       flex items-center justify-center gap-2"
                        >
                            Se connecter <FaArrowRight className="text-sm" />
                        </button>

                        {/* Séparateur */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">Pas de compte ?</span>
                            </div>
                        </div>

                        {/* Lien Inscription */}
                        <Link
                            to="/register"
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 
                                       text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <FaUserPlus className="text-sm" /> Créer un compte
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- COLONNE DROITE - HERO --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-16 relative overflow-hidden">

                {/* Pattern subtil */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="mb-8 inline-block">
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
                            <FaCity className="text-slate-900 text-5xl" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        Smart City Platform
                    </h2>

                    <p className="text-lg text-gray-400 leading-relaxed">
                        Une solution intégrée pour la gestion intelligente des infrastructures urbaines
                    </p>
                </div>

                <div className="absolute bottom-8 text-gray-500 text-sm">
                    © 2025 Smart City System
                </div>
            </div>

        </div>
    );
};

export default Login;