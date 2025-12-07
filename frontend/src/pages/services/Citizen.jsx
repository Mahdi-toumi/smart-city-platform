import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FaPlus, FaMapMarkerAlt, FaFilter, FaCheck, FaTimes, FaClock,
    FaExclamationCircle, FaClipboardList, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Citizen = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // État pour le formulaire
    const [formData, setFormData] = useState({ type: '', description: '', adresse: '' });

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MAIRE';

    // --- CHARGEMENT DES DONNÉES ---
    useEffect(() => {
        fetchData();
        api.get('/api/citizen/categories').then(res => setCategories(res.data));
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '/api/citizen/reclamations/me?citoyenId=' + user.username;

            if (isAdmin) {
                url = '/api/citizen/reclamations/all';
            }

            const res = await api.get(url);
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des réclamations");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/citizen/reclamations', { ...formData, citoyenId: user.username });

            document.getElementById('create_modal').close();
            setFormData({ type: '', description: '', adresse: '' });
            fetchData();

            toast.success("Réclamation envoyée avec succès !");

        } catch (err) {
            toast.error("Erreur lors de l'envoi du signalement.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/api/citizen/reclamations/${id}/status?status=${newStatus}`);
            fetchData();

            if (newStatus === 'TRAITEE') toast.success("Ticket marqué comme résolu ! ✅");
            if (newStatus === 'REJETEE') toast.error("Ticket rejeté ❌");
            if (newStatus === 'EN_COURS') toast("Ticket pris en charge 👨‍🔧", { icon: '🚧' });

        } catch (err) {
            toast.error("Impossible de modifier le statut");
        }
    };

    // --- FILTRAGE LOCAL ---
    const filteredComplaints = filterStatus === 'ALL'
        ? complaints
        : complaints.filter(c => c.statut === filterStatus);

    // --- HELPER VISUEL ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'OUVERTE':
                return {
                    border: 'border-l-4 border-red-500',
                    badge: 'bg-red-100 text-red-700',
                    barColor: 'bg-red-500'
                };
            case 'EN_COURS':
                return {
                    border: 'border-l-4 border-yellow-500',
                    badge: 'bg-yellow-100 text-yellow-700',
                    barColor: 'bg-yellow-500'
                };
            case 'TRAITEE':
                return {
                    border: 'border-l-4 border-green-500',
                    badge: 'bg-green-100 text-green-700',
                    barColor: 'bg-green-500'
                };
            default:
                return {
                    border: 'border-l-4 border-gray-300',
                    badge: 'bg-gray-100 text-gray-700',
                    barColor: 'bg-gray-500'
                };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OUVERTE': return <FaExclamationCircle className="text-red-500" />;
            case 'EN_COURS': return <FaHourglassHalf className="text-yellow-500" />;
            case 'TRAITEE': return <FaCheckCircle className="text-green-500" />;
            default: return <FaClipboardList className="text-gray-500" />;
        }
    };

    // Stats rapides
    const stats = {
        total: complaints.length,
        ouvertes: complaints.filter(c => c.statut === 'OUVERTE').length,
        enCours: complaints.filter(c => c.statut === 'EN_COURS').length,
        traitees: complaints.filter(c => c.statut === 'TRAITEE').length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Chargement des réclamations...</p>
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
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                                <FaClipboardList className="text-2xl" />
                            </div>
                            Espace Citoyen
                            {isAdmin && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                                    Vue Admin
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600 mt-2">Gérez les incidents et améliorez la ville</p>
                    </div>

                    <button
                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold 
                                 hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
                        onClick={() => document.getElementById('create_modal').showModal()}
                    >
                        <FaPlus /> Nouvelle Réclamation
                    </button>
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-lg">
                            <FaClipboardList className="text-3xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Ouvertes</p>
                            <p className="text-4xl font-bold text-red-600">{stats.ouvertes}</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg">
                            <FaExclamationCircle className="text-3xl text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">En Cours</p>
                            <p className="text-4xl font-bold text-yellow-600">{stats.enCours}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-lg">
                            <FaHourglassHalf className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Traitées</p>
                            <p className="text-4xl font-bold text-green-600">{stats.traitees}</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg">
                            <FaCheckCircle className="text-3xl text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <FaFilter className="text-gray-400" />
                    <span className="text-gray-600 font-semibold mr-2">Filtrer par statut :</span>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === 'ALL'
                            ? 'bg-slate-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setFilterStatus('ALL')}
                    >
                        Tous
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === 'OUVERTE'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        onClick={() => setFilterStatus('OUVERTE')}
                    >
                        Ouvertes
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === 'EN_COURS'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                        onClick={() => setFilterStatus('EN_COURS')}
                    >
                        En Cours
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === 'TRAITEE'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        onClick={() => setFilterStatus('TRAITEE')}
                    >
                        Traitées
                    </button>
                </div>
            </div>

            {/* LISTE DES RÉCLAMATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl shadow-md border-2 border-gray-300 p-12 text-center">
                        <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Aucune réclamation trouvée</p>
                        <p className="text-gray-400 text-sm mt-2">Modifiez vos filtres ou créez une nouvelle réclamation</p>
                    </div>
                ) : (
                    filteredComplaints.map((item) => {
                        const statusStyle = getStatusStyle(item.statut);
                        return (
                            <div key={item.id}
                                className={`bg-white rounded-xl shadow-md border-2 border-gray-300 
                                           overflow-hidden hover:shadow-xl transition-all ${statusStyle.border}`}>
                                {/* Barre de statut en haut */}
                                <div className={`h-2 ${statusStyle.barColor}`}></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg 
                                                       font-semibold text-sm">
                                            {item.type}
                                        </span>
                                        <span className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 
                                                        ${statusStyle.badge}`}>
                                            {getStatusIcon(item.statut)}
                                            {item.statut}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                                        {item.description}
                                    </h3>

                                    <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaMapMarkerAlt className="text-orange-500 flex-shrink-0" />
                                            <span className="truncate">{item.adresse || "Non spécifiée"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaClock className="text-blue-500 flex-shrink-0" />
                                            <span>{new Date(item.dateCreation).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                        {isAdmin && (
                                            <div className="text-xs font-mono text-gray-400 truncate">
                                                Par: {item.citoyenId}
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTIONS ADMIN */}
                                    {isAdmin && item.statut !== 'TRAITEE' && item.statut !== 'REJETEE' && (
                                        <div className="border-t-2 border-gray-300 pt-4 mt-4 flex gap-2">
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'EN_COURS')}
                                                className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg 
                                                         hover:bg-yellow-100 transition-all font-semibold text-sm
                                                         flex items-center justify-center gap-1"
                                            >
                                                <FaHourglassHalf /> En cours
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'TRAITEE')}
                                                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg 
                                                         hover:bg-green-100 transition-all font-semibold text-sm
                                                         flex items-center justify-center gap-1"
                                            >
                                                <FaCheck /> Résolu
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'REJETEE')}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg 
                                                         hover:bg-red-100 transition-all"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- MODALE DE CRÉATION --- */}
            <dialog id="create_modal" className="modal">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <h3 className="font-bold text-2xl mb-4 text-gray-900">Signaler un incident</h3>
                    <form onSubmit={handleCreate}>

                        <div className="mb-4">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Type d'incident
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 
                                         focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Adresse / Lieu
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Rue de la République"
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 
                                         focus:border-slate-900 focus:outline-none transition-all"
                                required
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Description détaillée
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                         focus:border-slate-900 focus:outline-none transition-all h-32"
                                placeholder="Décrivez le problème..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg 
                                         font-semibold hover:bg-gray-200 transition-all"
                                onClick={() => document.getElementById('create_modal').close()}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg 
                                         font-semibold hover:bg-slate-800 transition-all"
                            >
                                Envoyer
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

        </div>
    );
};

export default Citizen;