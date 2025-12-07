import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCity, FaSignOutAlt, FaUser, FaHome, FaBus, FaBullhorn, FaLeaf, FaBolt } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fonction pour vérifier si le lien est actif
    const isActive = (path) => {
        return location.pathname === path;

    };

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

            {/* --- CONTENU PRINCIPAL --- */}
            <div className="drawer-content flex flex-col bg-gray-100 min-h-screen">

                {/* Navbar Desktop - Amélioration */}
                <div className="hidden lg:flex navbar bg-white shadow-md border-b border-gray-300 px-8">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {location.pathname === '/' && 'Tableau de Bord'}
                            {location.pathname === '/mobility' && 'Mobilité & Trafic'}
                            {location.pathname === '/citizen' && 'Espace Citoyen'}
                            {location.pathname === '/energy' && 'Énergie'}
                            {location.pathname === '/environment' && 'Environnement'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg border-2 border-gray-300">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{user?.nomComplet || user?.username}</p>
                                <p className="text-xs text-gray-500">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navbar Mobile */}
                <div className="navbar bg-white shadow-md border-b border-gray-300 lg:hidden">
                    <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </label>
                    <div className="flex-1 px-2 mx-2 flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <FaCity className="text-white text-sm" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">SMART CITY</span>
                    </div>
                </div>

                {/* Zone de contenu dynamique */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>

                {/* Toast Notifications */}
                <Toaster position="top-right" />
            </div>

            {/* --- SIDEBAR (Menu Latéral) --- */}
            <div className="drawer-side z-50">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <div className="w-80 min-h-full bg-slate-900 shadow-2xl flex flex-col border-r-2 border-slate-700">

                    {/* Header Sidebar */}
                    <div className="p-6 border-b-2 border-slate-800 bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <FaCity className="text-slate-900 text-xl" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-white">SMART CITY</span>
                                <p className="text-xs text-gray-400">Plateforme de gestion</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 p-4 space-y-2">

                        {/* Dashboard */}
                        <Link
                            to="/"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white '
                                }`}
                        >
                            <FaHome className="text-lg" />
                            <span>Tableau de Bord</span>
                        </Link>

                        {/* Divider */}
                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ADMINISTRATION</p>
                        </div>

                        <Link
                            to="/admin/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/admin/users')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <FaUser className="text-lg" />
                            <span>Gestion Utilisateurs</span>
                        </Link>

                        {/* Divider */}
                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</p>
                        </div>

                        {/* Mobilité */}
                        <Link
                            to="/mobility"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/mobility')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <FaBus className="text-lg" />
                            <span>Mobilité & Trafic</span>
                        </Link>

                        {/* Citoyen */}
                        <Link
                            to="/citizen"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/citizen')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white '
                                }`}
                        >
                            <FaBullhorn className="text-lg" />
                            <span>Espace Citoyen</span>
                        </Link>

                        {/* Énergie */}
                        <Link
                            to="/energy"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/energy')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <FaBolt className="text-lg" />
                            <span>Énergie</span>
                        </Link>

                        {/* Environnement */}
                        <Link
                            to="/environment"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive('/environment')
                                ? 'bg-slate-700 text-slate-900 shadow-lg text-whiteg-white text-slate-900 shadow-lg border-2 border-white'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white '
                                }`}
                        >
                            <FaLeaf className="text-lg" />
                            <span>Environnement</span>
                        </Link>
                    </nav>

                    {/* User Profile (Bas de page) */}
                    <div className="p-4 border-b-2 border-slate-800 bg-slate-900">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg mb-3 ">
                            <div className="w-10 h-10 bg-white text-slate-900 rounded-lg flex items-center justify-center font-bold text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm truncate">{user?.nomComplet || user?.username}</p>
                                <p className="text-xs text-gray-400">{user?.role}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 
                                     hover:bg-red-900 hover:text-white rounded-lg font-medium transition-all"
                        >
                            <FaSignOutAlt />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;