import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCity, FaSignOutAlt, FaUser, FaHome, FaBus, FaBullhorn, FaLeaf, FaBolt } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

            {/* --- CONTENU PRINCIPAL --- */}
            <div className="drawer-content flex flex-col bg-gray-50 min-h-screen">
                {/* Navbar Mobile/Desktop */}
                <div className="navbar bg-base-100 shadow-sm lg:hidden">
                    <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </label>
                    <div className="flex-1 px-2 mx-2 text-xl font-bold text-primary">SmartCity</div>
                </div>

                {/* Zone de contenu dynamique (C'est ici que les pages changent) */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                    }}
                />
            </div>

            {/* --- SIDEBAR (Menu Latéral) --- */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col">
                    {/* Logo */}
                    <li className="mb-6">
                        <div className="flex items-center gap-3 text-2xl font-bold text-primary px-2">
                            <FaCity /> <span>SmartCity</span>
                        </div>
                    </li>

                    {/* Menu Items */}
                    <li><Link to="/"><FaHome /> Tableau de Bord</Link></li>

                    <div className="divider my-2">SERVICES</div>

                    <li><Link to="/mobility"><FaBus /> Mobilité & Trafic</Link></li>
                    <li><Link to="/citizen"><FaBullhorn /> Espace Citoyen</Link></li>
                    <li><Link to="/energy"><FaBolt /> Énergie</Link></li>
                    <li><Link to="/environment"><FaLeaf /> Environnement</Link></li>

                    {/* User Profile (Bas de page) */}
                    <div className="mt-auto">
                        <div className="divider"></div>
                        <div className="flex items-center gap-3 px-4 mb-4">
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-10">
                                    <span className="text-xl">{user?.username?.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold">{user?.nomComplet || user?.username}</p>
                                <p className="text-xs opacity-70 badge badge-outline">{user?.role}</p>
                            </div>
                        </div>
                        <li>
                            <button onClick={handleLogout} className="text-error">
                                <FaSignOutAlt /> Déconnexion
                            </button>
                        </li>
                    </div>
                </ul>

            </div>
        </div>
    );
};

export default MainLayout;