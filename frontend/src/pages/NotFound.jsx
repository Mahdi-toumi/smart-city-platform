import { Link } from 'react-router-dom';
import { FaCity, FaHome, FaMapSigns } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">

            {/* Pattern de fond (Subtil, comme sur le Login) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 p-8 text-center">

                    {/* Icône / Logo animé */}
                    <div className="mb-6 inline-block relative">
                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center shadow-lg mx-auto">
                            <FaCity className="text-white text-5xl" />
                        </div>
                        {/* Petite icône d'erreur flottante */}
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <FaMapSigns />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tight">404</h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Introuvable</h2>

                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Oups ! Vous semblez perdu dans les rues de la Smart City. Cette page n'existe pas ou a été déplacée.
                    </p>

                    {/* Bouton style "Smart City" */}
                    <Link
                        to="/"
                        className="btn w-full bg-slate-900 text-white hover:bg-slate-800 border-none font-bold h-12 shadow-md flex items-center justify-center gap-2 rounded-lg transition-all hover:scale-[1.02]"
                    >
                        <FaHome className="text-lg" /> Retour au Dashboard
                    </Link>
                </div>

                <div className="text-center mt-8 text-sm text-gray-400 font-medium">
                    © 2025 Smart City System
                </div>
            </div>
        </div>
    );
};

export default NotFound;