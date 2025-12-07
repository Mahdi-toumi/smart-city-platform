import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FaUserShield, FaTrash, FaUser, FaEnvelope, FaSearch, FaUsers,
    FaCrown, FaAmbulance, FaShieldAlt
} from 'react-icons/fa';
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // --- 1. Charger les utilisateurs ---
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            toast.error("Impossible de charger les utilisateurs (Accès Admin requis)");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Changer le Rôle ---
    const handleRoleChange = async (userId, newRole) => {
        const oldUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        const promise = api.patch(`/admin/users/${userId}/role?role=${newRole}`);

        toast.promise(promise, {
            loading: 'Mise à jour des droits...',
            success: `Rôle changé en ${newRole} !`,
            error: () => {
                setUsers(oldUsers);
                return "Erreur lors du changement de rôle";
            }
        });
    };

    // --- 3. Supprimer un utilisateur ---
    const handleDelete = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur définitivement ?")) return;

        const promise = api.delete(`/admin/users/${userId}`);

        toast.promise(promise, {
            loading: 'Suppression...',
            success: () => {
                setUsers(users.filter(u => u.id !== userId));
                return "Utilisateur banni définitivement";
            },
            error: "Erreur lors de la suppression"
        });
    };

    // --- Helpers Visuels ---
    const getRoleGradient = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-gradient-to-r from-red-600 to-red-500';
            case 'MAIRE': return 'bg-gradient-to-r from-purple-600 to-purple-500';
            case 'URGENCE': return 'bg-gradient-to-r from-orange-500 to-yellow-500';
            default: return 'bg-gradient-to-r from-slate-900 to-slate-700';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <FaShieldAlt className="text-xl" />;
            case 'MAIRE': return <FaCrown className="text-xl" />;
            case 'URGENCE': return <FaAmbulance className="text-xl" />;
            default: return <FaUser className="text-xl" />;
        }
    };

    // Filtrage
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in space-y-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg text-white">
                                <FaUserShield className="text-2xl" />
                            </div>
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-gray-600 mt-2">Administrez les accès et rôles de la plateforme</p>
                    </div>

                    {/* Barre de recherche */}
                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 
                                    focus:border-slate-900 focus:outline-none transition-all bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FaUsers className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Utilisateurs</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg text-red-600">
                            <FaShieldAlt className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Administrateurs</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'ADMIN').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                            <FaCrown className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Maires</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'MAIRE').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                            <FaAmbulance className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Services Urgence</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'URGENCE').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLE DES UTILISATEURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-md border-2 border-gray-300 
                                              overflow-hidden hover:shadow-xl transition-all">
                        {/* En-tête avec gradient selon rôle */}
                        <div className={`p-4 ${getRoleGradient(user.role)}`}>
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center 
                                          justify-center text-xl font-bold backdrop-blur-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg">{user.nomComplet || "Anonyme"}</div>
                                    <div className="text-sm opacity-90">@{user.username}</div>
                                </div>
                                {getRoleIcon(user.role)}
                            </div>
                        </div>

                        {/* Corps de carte */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <FaEnvelope className="text-gray-400" />
                                <span className="text-sm truncate">{user.email || "Non renseigné"}</span>
                            </div>

                            <div className="border-t-2 border-gray-300 pt-4 mb-4">
                                <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                    Modifier le rôle
                                </label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 
             focus:border-slate-900 focus:outline-none transition-all
             font-medium text-gray-900 bg-white"
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={user.role === 'ADMIN' && user.username === 'admin'}
                                >
                                    <option value="CITOYEN">Citoyen</option>
                                    <option value="MAIRE">Maire (Supervision)</option>
                                    <option value="URGENCE">Service Urgence</option>
                                    <option value="ADMIN">Administrateur</option>
                                </select>
                            </div>

                            <button
                                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg 
                                     hover:bg-red-100 transition-all font-semibold flex items-center 
                                     justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleDelete(user.id)}
                                disabled={user.role === 'ADMIN'}
                            >
                                <FaTrash /> Bannir l'utilisateur
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-12 text-center">
                    <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
                    <p className="text-gray-400 text-sm mt-2">Essayez de modifier votre recherche</p>
                </div>
            )}

            <div className="text-right text-sm text-gray-400">
                Affichage de {filteredUsers.length} sur {users.length} utilisateurs
            </div>
        </div>
    );
};
export default UsersManagement;