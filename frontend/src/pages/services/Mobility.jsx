import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FaBus, FaSubway, FaTrain, FaWalking, FaBicycle, FaCar,
    FaClock, FaArrowRight, FaPlus, FaTrash, FaExclamationTriangle,
    FaCheckCircle, FaMapMarkerAlt, FaChartLine
} from 'react-icons/fa';

const Mobility = () => {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [filterType, setFilterType] = useState('ALL');

    // Formulaire (Admin)
    const [formData, setFormData] = useState({
        depart: '', destination: '', typeTransport: '', dureeEstimee: 0, statusTrafic: 'FLUIDE'
    });

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MAIRE';

    // --- CHARGEMENT ---
    useEffect(() => {
        fetchRoutes();
        api.get('/api/mobility/types').then(res => setTypes(res.data));
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/mobility/trajets');
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des trajets");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ADMIN ---
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/mobility/trajets', formData);

            document.getElementById('create_modal').close();
            setFormData({ depart: '', destination: '', typeTransport: '', dureeEstimee: 0, statusTrafic: 'FLUIDE' });
            fetchRoutes();

            toast.success("Nouvelle ligne ajoutée au réseau ! 🚌");
        } catch (err) {
            console.error(err);
            toast.error("Impossible de créer le trajet. Vérifiez les données.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce trajet ?")) return;

        const deletePromise = api.delete(`/api/mobility/trajets/${id}`);

        toast.promise(deletePromise, {
            loading: 'Suppression en cours...',
            success: () => {
                setRoutes(routes.filter(r => r.id !== id));
                return 'Trajet supprimé définitivement 🗑️';
            },
            error: 'Erreur lors de la suppression.',
        });
    };

    const changeStatus = async (item, newStatus) => {
        try {
            const updatedItem = { ...item, statusTrafic: newStatus };
            await api.put(`/api/mobility/trajets/${item.id}`, updatedItem);
            fetchRoutes();

            if (newStatus === 'PERTURBE' || newStatus === 'ARRET') {
                toast("Alerte trafic signalée ! ⚠️", {
                    icon: '📢',
                    style: { background: '#FEF2F2', color: '#B91C1C' }
                });
            } else if (newStatus === 'FLUIDE') {
                toast.success("Retour à la normale ✅");
            } else {
                toast.success("Statut mis à jour");
            }

        } catch (err) {
            toast.error("Impossible de mettre à jour le statut.");
        }
    };

    // --- HELPERS VISUELS ---
    const getIcon = (type) => {
        switch (type) {
            case 'BUS': return <FaBus className="text-2xl" />;
            case 'METRO': return <FaSubway className="text-2xl" />;
            case 'TRAIN': return <FaTrain className="text-2xl" />;
            case 'TRAMWAY': return <FaSubway className="text-2xl" />;
            case 'VELO': return <FaBicycle className="text-2xl" />;
            case 'PIETON': return <FaWalking className="text-2xl" />;
            default: return <FaCar className="text-2xl" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'FLUIDE':
                return { border: 'border-l-4 border-green-500', badge: 'bg-green-100 text-green-700' };
            case 'DENSE':
                return { border: 'border-l-4 border-yellow-500', badge: 'bg-yellow-100 text-yellow-700' };
            case 'PERTURBE':
                return { border: 'border-l-4 border-orange-500', badge: 'bg-orange-100 text-orange-700' };
            case 'ARRET':
                return { border: 'border-l-4 border-red-500', badge: 'bg-red-100 text-red-700' };
            default:
                return { border: 'border-l-4 border-gray-300', badge: 'bg-gray-100 text-gray-700' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'FLUIDE': return <FaCheckCircle className="text-green-500 text-3xl" />;
            case 'PERTURBE': return <FaExclamationTriangle className="text-orange-500 text-3xl" />;
            case 'ARRET': return <FaExclamationTriangle className="text-red-500 text-3xl" />;
            default: return <FaChartLine className="text-yellow-500 text-3xl" />;
        }
    };

    // --- FILTRAGE ---
    const filteredRoutes = filterType === 'ALL'
        ? routes
        : routes.filter(r => r.typeTransport === filterType);

    // Stats rapides
    const stats = {
        total: routes.length,
        fluide: routes.filter(r => r.statusTrafic === 'FLUIDE').length,
        perturbe: routes.filter(r => r.statusTrafic === 'PERTURBE' || r.statusTrafic === 'ARRET').length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Chargement du réseau...</p>
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
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg text-white">
                                <FaCar className="text-2xl" />
                            </div>
                            Info Trafic & Transports
                        </h1>
                        <p className="text-gray-600 mt-2">Consultez les itinéraires et l'état du réseau en temps réel</p>
                    </div>
                    {isAdmin && (
                        <button
                            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold 
                                     hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
                            onClick={() => document.getElementById('create_modal').showModal()}
                        >
                            <FaPlus /> Ajouter une ligne
                        </button>
                    )}
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Lignes Actives</p>
                            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-lg">
                            <FaBus className="text-3xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Trafic Fluide</p>
                            <p className="text-4xl font-bold text-green-600">{stats.fluide}</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg">
                            <FaCheckCircle className="text-3xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Perturbations</p>
                            <p className="text-4xl font-bold text-orange-600">{stats.perturbe}</p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-lg">
                            <FaExclamationTriangle className="text-3xl text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterType === 'ALL'
                            ? 'bg-slate-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setFilterType('ALL')}
                    >
                        Tous les transports
                    </button>
                    {types.map(t => (
                        <button
                            key={t}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterType === t
                                ? 'bg-slate-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => setFilterType(t)}
                        >
                            {getIcon(t)} {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRILLE DES TRAJETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoutes.map((item) => {
                    const statusStyle = getStatusStyle(item.statusTrafic);
                    return (
                        <div key={item.id}
                            className={`bg-white rounded-xl shadow-md border-2 border-gray-300 
                                       overflow-hidden hover:shadow-xl transition-all ${statusStyle.border}`}>
                            {/* En-tête avec gradient */}
                            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        {getIcon(item.typeTransport)}
                                        <h3 className="font-bold text-lg">{item.typeTransport}</h3>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${statusStyle.badge}`}>
                                        {item.statusTrafic}
                                    </span>
                                </div>
                            </div>

                            {/* Corps de carte */}
                            <div className="p-6">
                                {/* Trajet */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <FaMapMarkerAlt className="text-orange-500" />
                                        <span>{item.depart}</span>
                                    </div>
                                    <FaArrowRight className="text-gray-400" />
                                    <span className="text-lg font-bold text-gray-900">{item.destination}</span>
                                </div>

                                {/* Durée */}
                                <div className="border-t-2 border-gray-300 pt-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <FaClock className="text-blue-500" /> Durée estimée
                                        </span>
                                        <span className="font-bold text-lg text-gray-900">
                                            {item.dureeLisible || `${item.dureeEstimee} min`}
                                        </span>
                                    </div>
                                </div>

                                {/* Statut visuel */}
                                <div className="flex items-center justify-center py-3">
                                    {getStatusIcon(item.statusTrafic)}
                                </div>

                                {/* ACTIONS ADMIN */}
                                {isAdmin && (
                                    <div className="border-t-2 border-gray-300 pt-4 flex gap-2">
                                        <div className="flex-1">
                                            <select
                                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 
                                               focus:border-slate-900 focus:outline-none transition-all text-sm font-medium bg-white text-gray-900"
                                                value={item.statusTrafic}
                                                onChange={(e) => changeStatus(item, e.target.value)}
                                            >
                                                <option value="FLUIDE">🟢 Fluide</option>
                                                <option value="DENSE">🟡 Dense</option>
                                                <option value="PERTURBE">🔴 Perturbé</option>
                                                <option value="ARRET">⚫ À l'arrêt</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg 
                                                     hover:bg-red-100 transition-all"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredRoutes.length === 0 && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-12 text-center">
                    <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun trajet trouvé</p>
                    <p className="text-gray-400 text-sm mt-2">Modifiez vos filtres pour voir plus de résultats</p>
                </div>
            )}

            {/* MODALE CRÉATION (Admin) */}
            <dialog id="create_modal" className="modal">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <h3 className="font-bold text-2xl mb-4 text-gray-900">Ajouter un trajet</h3>
                    <form onSubmit={handleCreate}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm text-gray-600 font-semibold mb-2 block">Départ</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 
                                     focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900"
                                    required
                                    onChange={e => setFormData({ ...formData, depart: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 font-semibold mb-2 block">Destination</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 
                                     focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900"
                                    required
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">Type</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 
                                 focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900"
                                required
                                onChange={e => setFormData({ ...formData, typeTransport: e.target.value })}
                            >
                                <option value="">Choisir...</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">Durée (minutes)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 
                                focus:border-slate-900 focus:outline-none transition-all bg-white text-gray-900"
                                required
                                min="1"
                                onChange={e => setFormData({ ...formData, dureeEstimee: e.target.value })}
                            />
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
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Mobility;