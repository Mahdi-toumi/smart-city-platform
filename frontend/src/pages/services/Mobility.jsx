import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FaBus, FaSubway, FaTrain, FaWalking, FaBicycle, FaCar,
    FaClock, FaArrowRight, FaPlus, FaTrash, FaExclamationTriangle
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
        // Charger les types pour le select (BUS, METRO...)
        api.get('/api/mobility/types').then(res => setTypes(res.data));
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/mobility/trajets');
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ADMIN ---
    // --- 1. CRÉATION (Avec succès simple) ---
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

    // --- 2. SUPPRESSION (Avec Promise pour l'effet de chargement) ---
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

    // --- 3. CHANGEMENT DE STATUT (Avec message dynamique) ---
    const changeStatus = async (item, newStatus) => {
        try {
            const updatedItem = { ...item, statusTrafic: newStatus };
            await api.put(`/api/mobility/trajets/${item.id}`, updatedItem);
            fetchRoutes();

            // Feedback visuel selon la gravité
            if (newStatus === 'PERTURBE' || newStatus === 'ARRET') {
                toast("Alerte trafic signalée ! ⚠️", {
                    icon: '📢',
                    style: { background: '#FEF2F2', color: '#B91C1C' } // Rouge clair
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
            case 'BUS': return <FaBus />;
            case 'METRO': return <FaSubway />;
            case 'TRAIN': return <FaTrain />;
            case 'TRAMWAY': return <FaSubway />; // Pas d'icone tram spécifique, on reuse subway
            case 'VELO': return <FaBicycle />;
            case 'PIETON': return <FaWalking />;
            default: return <FaCar />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FLUIDE': return 'badge-success text-white';
            case 'DENSE': return 'badge-warning';
            case 'PERTURBE': return 'badge-error text-white';
            case 'ARRET': return 'badge-neutral text-white';
            default: return 'badge-ghost';
        }
    };

    // --- FILTRAGE ---
    const filteredRoutes = filterType === 'ALL'
        ? routes
        : routes.filter(r => r.typeTransport === filterType);

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="fade-in">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        🚦 Info Trafic & Transports
                    </h1>
                    <p className="text-gray-500">Consultez les itinéraires et l'état du réseau en temps réel.</p>
                </div>
                {isAdmin && (
                    <button
                        className="btn btn-primary mt-4 md:mt-0"
                        onClick={() => document.getElementById('create_modal').showModal()}
                    >
                        <FaPlus /> Ajouter une ligne
                    </button>
                )}
            </div>

            {/* FILTRES */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button className={`btn btn-sm ${filterType === 'ALL' ? 'btn-neutral' : 'btn-ghost'}`} onClick={() => setFilterType('ALL')}>Tous</button>
                {types.map(t => (
                    <button
                        key={t}
                        className={`btn btn-sm ${filterType === t ? 'btn-neutral' : 'btn-ghost'}`}
                        onClick={() => setFilterType(t)}
                    >
                        {getIcon(t)} {t}
                    </button>
                ))}
            </div>

            {/* GRILLE DES TRAJETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoutes.map((item) => (
                    <div key={item.id} className={`card bg-base-100 shadow-md border-l-4 ${item.statusTrafic === 'PERTURBE' || item.statusTrafic === 'ARRET' ? 'border-error' : 'border-success'}`}>
                        <div className="card-body">
                            {/* En-tête Carte */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-xl font-bold text-gray-700">
                                    {getIcon(item.typeTransport)}
                                    <span>{item.typeTransport}</span>
                                </div>
                                <div className={`badge ${getStatusColor(item.statusTrafic)} font-bold`}>
                                    {item.statusTrafic}
                                </div>
                            </div>

                            {/* Trajet */}
                            <div className="flex items-center gap-3 my-4 text-lg font-medium">
                                <span>{item.depart}</span>
                                <FaArrowRight className="text-gray-400" />
                                <span>{item.destination}</span>
                            </div>

                            {/* Durée */}
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <FaClock />
                                <span>Durée estimée : {item.dureeLisible}</span> {/* Utilise le champ calculé JSON du backend */}
                            </div>

                            {/* ACTIONS ADMIN (Changer Statut) */}
                            {isAdmin && (
                                <div className="card-actions justify-end mt-4 pt-4 border-t">
                                    <div className="dropdown dropdown-top dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-xs btn-outline">Changer Statut</div>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                            <li><a onClick={() => changeStatus(item, 'FLUIDE')}>🟢 Fluide</a></li>
                                            <li><a onClick={() => changeStatus(item, 'DENSE')}>🟡 Dense</a></li>
                                            <li><a onClick={() => changeStatus(item, 'PERTURBE')}>🔴 Perturbé</a></li>
                                            <li><a onClick={() => changeStatus(item, 'ARRET')}>⚫ À l'arrêt</a></li>
                                        </ul>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="btn btn-xs btn-circle btn-ghost text-error">
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE CRÉATION (Admin) */}
            <dialog id="create_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Ajouter un trajet</h3>
                    <form onSubmit={handleCreate}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">Départ</label>
                                <input type="text" className="input input-bordered" required
                                    onChange={e => setFormData({ ...formData, depart: e.target.value })} />
                            </div>
                            <div className="form-control">
                                <label className="label">Destination</label>
                                <input type="text" className="input input-bordered" required
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-control mt-3">
                            <label className="label">Type</label>
                            <select className="select select-bordered" required
                                onChange={e => setFormData({ ...formData, typeTransport: e.target.value })}>
                                <option value="">Choisir...</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="form-control mt-3">
                            <label className="label">Durée (minutes)</label>
                            <input type="number" className="input input-bordered" required min="1"
                                onChange={e => setFormData({ ...formData, dureeEstimee: e.target.value })} />
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('create_modal').close()}>Fermer</button>
                            <button type="submit" className="btn btn-primary">Créer</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Mobility;