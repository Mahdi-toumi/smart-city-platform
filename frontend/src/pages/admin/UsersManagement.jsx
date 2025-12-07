import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FaUserShield, FaTrash, FaUser, FaEnvelope, FaSearch, FaUsers,
    FaCrown, FaAmbulance, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // État pour stocker l'ID de l'utilisateur à supprimer
    const [deleteUserId, setDeleteUserId] = useState(null);
    const deleteModalRef = useRef(null);

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

    // --- 3. Gestion Suppression (Modale) ---
    const openDeleteModal = (id) => {
        setDeleteUserId(id);
        deleteModalRef.current.showModal();
    };

    const confirmDelete = async () => {
        if (!deleteUserId) return;

        const promise = api.delete(`/admin/users/${deleteUserId}`);

        toast.promise(promise, {
            loading: 'Suppression en cours...',
            success: () => {
                setUsers(users.filter(u => u.id !== deleteUserId));
                deleteModalRef.current.close();
                setDeleteUserId(null);
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
        <div className="fade-in space-y-8 p-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg text-white shadow-md">
                                <FaUserShield className="text-2xl" />
                            </div>
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Administrez les accès et rôles de la plateforme.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 
                                     focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900 h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-blue-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Total Utilisateurs</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{users.length}</p></div>
                    <div className="p-4 bg-blue-100 rounded-full border border-blue-200 text-blue-600"><FaUsers className="text-2xl" /></div>
                </div>
                {/* Admins */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-red-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Administrateurs</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{users.filter(u => u.role === 'ADMIN').length}</p></div>
                    <div className="p-4 bg-red-100 rounded-full border border-red-200 text-red-600"><FaShieldAlt className="text-2xl" /></div>
                </div>
                {/* Maires */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-purple-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Maires</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{users.filter(u => u.role === 'MAIRE').length}</p></div>
                    <div className="p-4 bg-purple-100 rounded-full border border-purple-200 text-purple-600"><FaCrown className="text-2xl" /></div>
                </div>
                {/* Urgence */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-orange-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Services Urgence</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{users.filter(u => u.role === 'URGENCE').length}</p></div>
                    <div className="p-4 bg-orange-100 rounded-full border border-orange-200 text-orange-600"><FaAmbulance className="text-2xl" /></div>
                </div>
            </div>

            {/* GRILLE UTILISATEURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`p-4 ${getRoleGradient(user.role)}`}>
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm shadow-inner">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-lg truncate">{user.nomComplet || "Anonyme"}</div>
                                    <div className="text-sm opacity-90 truncate">@{user.username}</div>
                                </div>
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                    {getRoleIcon(user.role)}
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <FaEnvelope className="text-gray-400" />
                                <span className="text-sm font-medium truncate">{user.email || "Email non renseigné"}</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Modifier le rôle</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-slate-900 focus:outline-none transition-all font-bold text-gray-900 bg-white h-auto"
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
                                    className="w-full px-4 py-3 bg-white text-red-600 rounded-lg border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    // 💡 ACTION : Ouvre la modale au lieu de window.confirm
                                    onClick={() => openDeleteModal(user.id)}
                                    disabled={user.role === 'ADMIN'}
                                >
                                    <FaTrash /> Bannir l'utilisateur
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-16 text-center">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaSearch className="text-5xl text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">Aucun utilisateur trouvé</h3>
                    <p className="text-gray-500 mt-2">Essayez de modifier votre recherche.</p>
                </div>
            )}

            <div className="text-right text-sm text-gray-400 font-medium">
                Affichage de {filteredUsers.length} sur {users.length} utilisateurs
            </div>

            {/* --- MODALE DE CONFIRMATION DE SUPPRESSION --- */}
            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box !max-w-md w-full !bg-white p-0 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Header Rouge Danger */}
                    <div className="bg-red-600 p-6 text-white text-center">
                        <h3 className="font-bold text-2xl">Bannir l'utilisateur ?</h3>
                    </div>

                    <div className="p-8 text-center">
                        <p className="text-gray-600 text-lg mb-2">
                            Cette action est <span className="font-bold text-red-600">irréversible</span>.
                        </p>
                        <p className="text-sm text-gray-500">
                            L'utilisateur perdra immédiatement accès à la plateforme et toutes ses données seront supprimées.
                        </p>

                        <div className="flex gap-4 pt-8">
                            <button
                                className="flex-1 btn bg-gray-200 text-black border border-gray-400 hover:bg-gray-300 font-bold h-12"
                                onClick={() => {
                                    deleteModalRef.current.close();
                                    setDeleteUserId(null);
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                className="flex-1 btn bg-red-600 text-white border-none hover:bg-red-700 font-bold h-12 shadow-lg"
                                onClick={confirmDelete}
                            >
                                Oui, Bannir
                            </button>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
};

export default UsersManagement;