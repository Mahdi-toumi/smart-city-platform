import { Link } from 'react-router-dom';
import { FaCity, FaHome, FaServer, FaRedoAlt } from 'react-icons/fa';

const ServerError = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">

            {/* Pattern de fond */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 p-8 text-center">

                    {/* Icône Serveur en panne */}
                    <div className="mb-6 inline-block relative">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center shadow-inner mx-auto border-2 border-red-100">
                            <FaServer className="text-red-500 text-5xl" />
                        </div>
                        {/* Petite icône warning flottante */}
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <FaCity className="text-sm" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tight">500</h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur Serveur</h2>

                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Oups ! Nos serveurs rencontrent un problème technique.
                        Nos équipes de la Smart City sont sur le coup.
                    </p>

                    <div className="space-y-3">
                        {/* Bouton Rafraîchir */}
                        <button
                            onClick={() => window.location.reload()}
                            className="btn w-full bg-slate-900 text-white hover:bg-slate-800 border-none font-bold h-12 shadow-md flex items-center justify-center gap-2 rounded-lg transition-all hover:scale-[1.02]"
                        >
                            <FaRedoAlt /> Réessayer
                        </button>

                        {/* Bouton Accueil */}
                        <Link
                            to="/"
                            className="btn w-full bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300 font-bold h-12 flex items-center justify-center gap-2 rounded-lg transition-all"
                        >
                            <FaHome className="text-lg" /> Retour au Dashboard
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-gray-400 font-medium">
                    © 2025 Smart City System
                </div>
            </div>
        </div>
    );
};

export default ServerError;