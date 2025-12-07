import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaMapMarkerAlt, FaFilter, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
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
        // Charger les catégories pour le formulaire
        api.get('/api/citizen/categories').then(res => setCategories(res.data));
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '/api/citizen/reclamations/me?citoyenId=' + user.username;

            // Si Admin, on voit tout
            if (isAdmin) {
                url = '/api/citizen/reclamations/all';
            }

            const res = await api.get(url);
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
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

            //  BEAUTÉ
            toast.success("Réclamation envoyée avec succès !");

        } catch (err) {
            toast.error("Erreur lors de l'envoi du signalement.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/api/citizen/reclamations/${id}/status?status=${newStatus}`);
            fetchData();

            // Message personnalisé selon le statut
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
    const getStatusBadge = (status) => {
        switch (status) {
            case 'OUVERTE': return 'badge-error';
            case 'EN_COURS': return 'badge-warning';
            case 'TRAITEE': return 'badge-success';
            default: return 'badge-ghost';
        }
    };

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="fade-in">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        📢 Espace Citoyen
                        {isAdmin && <span className="badge badge-primary badge-outline">Vue Admin</span>}
                    </h1>
                    <p className="text-gray-500">Gérez les incidents et améliorez la ville.</p>
                </div>

                {/* BOUTON CRÉER (Visible pour tout le monde) */}
                <button
                    className="btn btn-primary mt-4 md:mt-0"
                    onClick={() => document.getElementById('create_modal').showModal()}
                >
                    <FaPlus /> Nouvelle Réclamation
                </button>
            </div>

            {/* FILTRES */}
            <div className="tabs tabs-boxed mb-6 bg-base-100 shadow-sm w-fit">
                <a className={`tab ${filterStatus === 'ALL' ? 'tab-active' : ''}`} onClick={() => setFilterStatus('ALL')}>Tous</a>
                <a className={`tab ${filterStatus === 'OUVERTE' ? 'tab-active' : ''}`} onClick={() => setFilterStatus('OUVERTE')}>Ouvertes</a>
                <a className={`tab ${filterStatus === 'TRAITEE' ? 'tab-active' : ''}`} onClick={() => setFilterStatus('TRAITEE')}>Traitées</a>
            </div>

            {/* LISTE DES RÉCLAMATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-400">Aucune réclamation trouvée.</div>
                ) : (
                    filteredComplaints.map((item) => (
                        <div key={item.id} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div className="badge badge-outline">{item.type}</div>
                                    <div className={`badge ${getStatusBadge(item.statut)} text-white`}>{item.statut}</div>
                                </div>

                                <h3 className="font-bold mt-2 text-lg line-clamp-1">{item.description}</h3>

                                <div className="text-sm text-gray-500 mt-2 space-y-1">
                                    <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary" /> {item.adresse || "Non spécifiée"}</p>
                                    <p className="flex items-center gap-2"><FaClock /> {new Date(item.dateCreation).toLocaleDateString()}</p>
                                    {isAdmin && <p className="text-xs font-mono">Citoyen: {item.citoyenId}</p>}
                                </div>

                                {/* ACTIONS ADMIN */}
                                {isAdmin && item.statut !== 'TRAITEE' && (
                                    <div className="card-actions justify-end mt-4 pt-4 border-t">
                                        <button
                                            onClick={() => handleStatusChange(item.id, 'EN_COURS')}
                                            className="btn btn-xs btn-warning tooltip" data-tip="Prendre en charge"
                                        >
                                            En cours
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(item.id, 'TRAITEE')}
                                            className="btn btn-xs btn-success text-white tooltip" data-tip="Marquer résolu"
                                        >
                                            <FaCheck />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(item.id, 'REJETEE')}
                                            className="btn btn-xs btn-error text-white tooltip" data-tip="Rejeter"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- MODALE DE CRÉATION --- */}
            <dialog id="create_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Signaler un incident</h3>
                    <form onSubmit={handleCreate}>

                        <div className="form-control w-full mb-3">
                            <label className="label"><span className="label-text">Type d'incident</span></label>
                            <select
                                className="select select-bordered"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="form-control w-full mb-3">
                            <label className="label"><span className="label-text">Adresse / Lieu</span></label>
                            <input
                                type="text"
                                placeholder="Ex: Rue de la République"
                                className="input input-bordered"
                                required
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </div>

                        <div className="form-control w-full mb-4">
                            <label className="label"><span className="label-text">Description détaillée</span></label>
                            <textarea
                                className="textarea textarea-bordered h-24"
                                placeholder="Décrivez le problème..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('create_modal').close()}>Annuler</button>
                            <button type="submit" className="btn btn-primary">Envoyer</button>
                        </div>
                    </form>
                </div>
            </dialog>

        </div>
    );
};

export default Citizen;