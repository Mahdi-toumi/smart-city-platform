import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaCity, FaUser, FaLock, FaEye, FaEyeSlash,
    FaSignInAlt, FaUserPlus, FaEnvelope, FaMapMarkerAlt, FaIdCard
} from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        nomComplet: '',
        email: '',
        adresse: '',
        role: 'CITOYEN'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation de l'email
        if (formData.email && !validateEmail(formData.email)) {
            setError("Format d'email invalide");
            return;
        }

        // Validation des mots de passe
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'inscription. Vérifiez que le pseudo n'est pas déjà pris.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">

            {/* --- COLONNE GAUCHE - HERO --- */}
            <div className="hidden lg:flex lg:w-2/5 bg-slate-900 items-center justify-center p-16 relative overflow-hidden">

                {/* Pattern subtil */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>

                <div className="relative z-10 text-center max-w-md">
                    <div className="mb-8 inline-block">
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
                            <FaCity className="text-slate-900 text-5xl" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        Rejoignez-nous
                    </h2>

                    <p className="text-lg text-gray-400 leading-relaxed">
                        Devenez acteur de votre ville intelligente et contribuez à son développement
                    </p>
                </div>

                <div className="absolute bottom-8 text-gray-500 text-sm">
                    © 2025 Smart City System
                </div>
            </div>

            {/* --- COLONNE DROITE - FORMULAIRE --- */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-2xl">

                    {/* Header Mobile */}
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                                <FaCity className="text-white text-xl" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">SMART CITY</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                        <p className="text-gray-600">Remplissez les informations ci-dessous</p>
                    </div>

                    <div onSubmit={handleSubmit}>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">

                            {/* Grid 2 colonnes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nom d'utilisateur <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="johndoe"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="john@example.com"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirmer le mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Nom Complet */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nom complet
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaIdCard className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nomComplet"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="John Doe"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Adresse */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Adresse
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            name="adresse"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                                                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                                                     transition-all text-gray-900"
                                            placeholder="123 Rue de la République"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg
                                     font-semibold hover:bg-slate-800 transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus className="text-sm" /> Créer mon compte
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">Déjà inscrit ?</span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link
                            to="/login"
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 
                                     text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <FaSignInAlt className="text-sm" /> Se connecter
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;