import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FaBus, FaSubway, FaTrain, FaWalking, FaBicycle, FaCar,
    FaClock, FaArrowRight, FaPlus, FaTrash, FaExclamationTriangle,
    FaCheckCircle, FaChartLine, FaMapMarkerAlt
} from 'react-icons/fa';

const Mobility = () => {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('ALL');
    const [formData, setFormData] = useState({
        depart: '', destination: '', typeTransport: '', dureeEstimee: 0, statusTrafic: 'FLUIDE'
    });

    // Gestion Suppression
    const [deleteRouteId, setDeleteRouteId] = useState(null);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MAIRE';

    // Refs pour les modales
    const createModalRef = useRef(null);
    const deleteModalRef = useRef(null);

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

    // --- ACTIONS ---
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/mobility/trajets', formData);
            createModalRef.current.close();
            setFormData({ depart: '', destination: '', typeTransport: '', dureeEstimee: 0, statusTrafic: 'FLUIDE' });
            fetchRoutes();
            toast.success("Nouvelle ligne ajoutée au réseau ! 🚌");
        } catch (err) {
            toast.error("Impossible de créer le trajet. Vérifiez les données.");
        }
    };

    // Ouverture Modale Suppression
    const openDeleteModal = (id) => {
        setDeleteRouteId(id);
        deleteModalRef.current.showModal();
    };

    // Confirmation Suppression
    const confirmDelete = async () => {
        if (!deleteRouteId) return;

        const deletePromise = api.delete(`/api/mobility/trajets/${deleteRouteId}`);

        toast.promise(deletePromise, {
            loading: 'Suppression en cours...',
            success: () => {
                setRoutes(routes.filter(r => r.id !== deleteRouteId));
                deleteModalRef.current.close();
                setDeleteRouteId(null);
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
                toast("Alerte trafic signalée ! ⚠️", { icon: '📢', style: { background: '#FEF2F2', color: '#B91C1C' } });
            } else if (newStatus === 'FLUIDE') {
                toast.success("Retour à la normale ✅");
            } else {
                toast.success("Statut mis à jour");
            }
        } catch (err) {
            toast.error("Impossible de mettre à jour le statut.");
        }
    };

    // --- HELPERS ---
    const getIcon = (type) => {
        switch (type) {
            case 'BUS': return <FaBus className="text-xl" />;
            case 'METRO': return <FaSubway className="text-xl" />;
            case 'TRAIN': return <FaTrain className="text-xl" />;
            case 'TRAMWAY': return <FaSubway className="text-xl" />;
            case 'VELO': return <FaBicycle className="text-xl" />;
            case 'PIETON': return <FaWalking className="text-xl" />;
            default: return <FaCar className="text-xl" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'FLUIDE': return { border: 'border-l-4 border-green-500', badge: 'bg-green-100 text-green-700 border border-green-200' };
            case 'DENSE': return { border: 'border-l-4 border-yellow-500', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
            case 'PERTURBE': return { border: 'border-l-4 border-orange-500', badge: 'bg-orange-100 text-orange-700 border border-orange-200' };
            case 'ARRET': return { border: 'border-l-4 border-red-500', badge: 'bg-red-100 text-red-700 border border-red-200' };
            default: return { border: 'border-l-4 border-gray-300', badge: 'bg-gray-100 text-gray-700 border border-gray-200' };
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

    const filteredRoutes = filterType === 'ALL' ? routes : routes.filter(r => r.typeTransport === filterType);

    const stats = {
        total: routes.length,
        fluide: routes.filter(r => r.statusTrafic === 'FLUIDE').length,
        perturbe: routes.filter(r => r.statusTrafic === 'PERTURBE' || r.statusTrafic === 'ARRET').length
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="fade-in space-y-8 p-6">
            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg text-white shadow-md">
                                <FaCar className="text-2xl" />
                            </div>
                            Mobilité & Trafic
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Consultez les itinéraires et l'état du réseau en temps réel.</p>
                    </div>
                    {isAdmin && (
                        <button
                            className="btn btn-primary px-6 py-3 rounded-lg font-bold shadow-lg flex items-center text-black border border-gray-500 hover:scale-105 transition-transform"
                            onClick={() => createModalRef.current.showModal()}
                        >
                            <FaPlus className="mr-2" /> Ajouter une ligne
                        </button>
                    )}
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-blue-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Lignes Actives</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{stats.total}</p></div>
                    <div className="p-4 bg-blue-100 rounded-full border border-blue-200"><FaBus className="text-3xl text-blue-600" /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-green-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Trafic Fluide</p><p className="text-4xl font-extrabold text-green-600 mt-1">{stats.fluide}</p></div>
                    <div className="p-4 bg-green-100 rounded-full border border-green-200"><FaCheckCircle className="text-3xl text-green-600" /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-orange-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Perturbations</p><p className="text-4xl font-extrabold text-orange-600 mt-1">{stats.perturbe}</p></div>
                    <div className="p-4 bg-orange-100 rounded-full border border-orange-200"><FaExclamationTriangle className="text-3xl text-orange-600" /></div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 flex flex-wrap gap-2">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setFilterType('ALL')}
                >
                    TOUS LES TRANSPORTS
                </button>
                {types.map(t => (
                    <button
                        key={t}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterType === t ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setFilterType(t)}
                    >
                        {getIcon(t)} {t}
                    </button>
                ))}
            </div>

            {/* GRILLE DES TRAJETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoutes.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-300 p-16 text-center">
                        <FaCar className="text-5xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">Aucun trajet trouvé</h3>
                    </div>
                ) : (
                    filteredRoutes.map((item) => {
                        const statusStyle = getStatusStyle(item.statusTrafic);
                        return (
                            <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all ${statusStyle.border}`}>
                                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        {getIcon(item.typeTransport)}
                                        <h3 className="font-bold text-lg">{item.typeTransport}</h3>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyle.badge}`}>
                                        {item.statusTrafic}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Départ</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                                                <FaMapMarkerAlt className="text-orange-500" /> {item.depart}
                                            </div>
                                        </div>
                                        <FaArrowRight className="text-gray-300 text-xl" />
                                        <div className="flex-1 text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Arrivée</p>
                                            <span className="font-bold text-gray-900 text-lg">{item.destination}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex justify-between items-center mb-4">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 font-medium">
                                            <FaClock className="text-blue-500" /> Durée estimée
                                        </span>
                                        <span className="font-bold text-lg text-slate-900">
                                            {item.dureeLisible || `${item.dureeEstimee} min`}
                                        </span>
                                    </div>

                                    <div className="flex justify-center py-2">
                                        {getStatusIcon(item.statusTrafic)}
                                    </div>

                                    {isAdmin && (
                                        <div className="border-t border-gray-100 pt-4 mt-2 flex gap-2">
                                            <div className="flex-1">
                                                <select
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-slate-900 focus:ring-0 text-sm font-bold bg-white text-gray-700 h-10"
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
                                                // 💡 ACTION : Ouvre la modale de suppression
                                                onClick={() => openDeleteModal(item.id)}
                                                className="px-4 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-all h-10 flex items-center justify-center"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODALE CRÉATION (Admin) */}
            <dialog ref={createModalRef} id="create_modal" className="modal">
                <div className="modal-box !max-w-lg w-full !bg-white p-0 rounded-2xl shadow-2xl overflow-hidden scrollbar-hide">
                    <div className="bg-slate-900 p-6 text-white">
                        <h3 className="font-bold text-2xl flex items-center gap-2">
                            <FaPlus className="text-primary" /> Ajouter un trajet
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Configurez une nouvelle ligne de transport.</p>
                    </div>

                    <form onSubmit={handleCreate} className="p-8 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1.5 block uppercase">Départ</label>
                                <input type="text" className="input p-4 w-full bg-white border-2 border-gray-400 focus:border-primary text-gray-900 py-3 h-auto" required onChange={e => setFormData({ ...formData, depart: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1.5 block uppercase">Destination</label>
                                <input type="text" className="input p-4 w-full bg-white border-2 border-gray-400 focus:border-primary text-gray-900 py-3 h-auto" required onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1.5 block uppercase">Type de transport</label>
                            <select className="select p-4 w-full bg-white border-2 border-gray-400 focus:border-primary text-gray-900 py-3 h-auto" required onChange={e => setFormData({ ...formData, typeTransport: e.target.value })}>
                                <option value="">Choisir...</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1.5 block uppercase">Durée (minutes)</label>
                            <input type="number" className="input p-4 w-full bg-white border-2 border-gray-400 focus:border-primary text-gray-900 py-3 h-auto" required min="1" onChange={e => setFormData({ ...formData, dureeEstimee: e.target.value })} />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" className="flex-1 btn bg-gray-200 text-black border border-gray-400 hover:bg-gray-300 font-bold h-12" onClick={() => createModalRef.current.close()}>Annuler</button>
                            <button type="submit" className="flex-1 btn btn-primary shadow-lg text-black border border-gray-500 font-bold h-12">Créer le trajet</button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

            {/* --- MODALE DE CONFIRMATION DE SUPPRESSION --- */}
            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box !max-w-md w-full !bg-white p-0 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-red-600 p-6 text-white text-center">
                        <h3 className="font-bold text-2xl">Supprimer ce trajet ?</h3>
                    </div>

                    <div className="p-8 text-center">
                        <p className="text-gray-600 text-lg mb-2">
                            Cette action est <span className="font-bold text-red-600">irréversible</span>.
                        </p>
                        <p className="text-sm text-gray-500">
                            Le trajet sera retiré définitivement du réseau de transport.
                        </p>

                        <div className="flex gap-4 pt-8">
                            <button
                                className="flex-1 btn bg-gray-200 text-black border border-gray-400 hover:bg-gray-300 font-bold h-12"
                                onClick={() => {
                                    deleteModalRef.current.close();
                                    setDeleteRouteId(null);
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                className="flex-1 btn bg-red-600 text-white border-none hover:bg-red-700 font-bold h-12 shadow-lg"
                                onClick={confirmDelete}
                            >
                                Oui, Supprimer
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

export default Mobility;