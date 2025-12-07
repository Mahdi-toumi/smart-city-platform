import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FaPlus, FaMapMarkerAlt, FaFilter, FaCheck, FaTimes, FaClock,
    FaExclamationCircle, FaClipboardList, FaCheckCircle, FaHourglassHalf, FaUndo
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Citizen = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [formData, setFormData] = useState({ type: '', description: '', adresse: '' });

    // 💡 DISTINCTION DES RÔLES
    // isAdmin : Pour voir TOUTES les réclamations
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MAIRE';
    // isMaire : Pour AGIR sur les réclamations (Traiter/Résoudre)
    const isMaire = user?.role === 'MAIRE';

    const modalRef = useRef(null);

    useEffect(() => {
        fetchData();
        api.get('/api/citizen/categories').then(res => setCategories(res.data));
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '/api/citizen/reclamations/me?citoyenId=' + user.username;
            if (isAdmin) url = '/api/citizen/reclamations/all';
            const res = await api.get(url);
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des réclamations");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/citizen/reclamations', { ...formData, citoyenId: user.username });
            modalRef.current.close();
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

    // --- FILTRAGE & HELPERS ---
    const filteredComplaints = filterStatus === 'ALL' ? complaints : complaints.filter(c => c.statut === filterStatus);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OUVERTE': return { border: 'border-l-4 border-red-500', badge: 'bg-red-100 text-red-700 border border-red-200', barColor: 'bg-red-500' };
            case 'EN_COURS': return { border: 'border-l-4 border-yellow-500', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', barColor: 'bg-yellow-500' };
            case 'TRAITEE': return { border: 'border-l-4 border-green-500', badge: 'bg-green-100 text-green-700 border border-green-200', barColor: 'bg-green-500' };
            default: return { border: 'border-l-4 border-gray-300', badge: 'bg-gray-100 text-gray-700 border border-gray-200', barColor: 'bg-gray-500' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OUVERTE': return <FaExclamationCircle className="text-red-600" />;
            case 'EN_COURS': return <FaHourglassHalf className="text-yellow-600" />;
            case 'TRAITEE': return <FaCheckCircle className="text-green-600" />;
            default: return <FaClipboardList className="text-gray-500" />;
        }
    };

    const stats = {
        total: complaints.length,
        ouvertes: complaints.filter(c => c.statut === 'OUVERTE').length,
        enCours: complaints.filter(c => c.statut === 'EN_COURS').length,
        traitees: complaints.filter(c => c.statut === 'TRAITEE').length
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="fade-in space-y-8 p-6">
            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white shadow-md">
                                <FaClipboardList className="text-2xl" />
                            </div>
                            Espace Citoyen
                            {isAdmin && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">VUE ADMIN</span>}
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Gérez les incidents et améliorez la qualité de vie urbaine.</p>
                    </div>

                    <button
                        className="btn btn-primary px-6 py-3 rounded-lg font-bold shadow-lg flex items-center text-black border border-gray-500 hover:scale-105 transition-transform"
                        onClick={() => modalRef.current.showModal()}
                    >
                        <FaPlus className="mr-2" /> Nouvelle Réclamation
                    </button>
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-blue-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Total</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{stats.total}</p></div>
                    <div className="p-4 bg-blue-100 rounded-full border border-blue-200"><FaClipboardList className="text-3xl text-blue-600" /></div>
                </div>
                {/* Ouvertes */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-red-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Ouvertes</p><p className="text-4xl font-extrabold text-red-600 mt-1">{stats.ouvertes}</p></div>
                    <div className="p-4 bg-red-100 rounded-full border border-red-200"><FaExclamationCircle className="text-3xl text-red-600" /></div>
                </div>
                {/* En Cours */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-yellow-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">En Cours</p><p className="text-4xl font-extrabold text-yellow-600 mt-1">{stats.enCours}</p></div>
                    <div className="p-4 bg-yellow-100 rounded-full border border-yellow-200"><FaHourglassHalf className="text-3xl text-yellow-600" /></div>
                </div>
                {/* Traitées */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-green-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Traitées</p><p className="text-4xl font-extrabold text-green-600 mt-1">{stats.traitees}</p></div>
                    <div className="p-4 bg-green-100 rounded-full border border-green-200"><FaCheckCircle className="text-3xl text-green-600" /></div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-500"><FaFilter /><span className="font-semibold text-sm uppercase">Filtrer par statut :</span></div>
                <div className="flex gap-2">
                    {['ALL', 'OUVERTE', 'EN_COURS', 'TRAITEE'].map(status => (
                        <button
                            key={status}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'ALL' ? 'TOUS' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTE DES RÉCLAMATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-300 p-16 text-center">
                        <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">Aucune réclamation trouvée</h3>
                    </div>
                ) : (
                    filteredComplaints.map((item) => {
                        const statusStyle = getStatusStyle(item.statut);
                        return (
                            <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all ${statusStyle.border}`}>
                                <div className={`h-1.5 ${statusStyle.barColor} w-full`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-bold text-xs uppercase border border-slate-200">{item.type}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${statusStyle.badge}`}>{getStatusIcon(item.statut)} {item.statut}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">{item.description}</h3>
                                    <div className="border-t border-gray-100 pt-4 space-y-2.5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600"><FaMapMarkerAlt className="text-red-500" /><span className="truncate font-medium">{item.adresse || "Non spécifiée"}</span></div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600"><FaClock className="text-blue-500" /><span className="font-medium">{new Date(item.dateCreation).toLocaleDateString()}</span></div>
                                    </div>

                                    {/* 💡 ACTIONS VISIBLES UNIQUEMENT POUR LE MAIRE */}
                                    {isMaire && (
                                        <div className="border-t border-gray-200 pt-4 mt-4 flex gap-2">

                                            {/* Bouton TRAITER / ROUVRIR */}
                                            {item.statut !== 'EN_COURS' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'EN_COURS')}
                                                    className={`btn btn-sm border-none font-bold text-white
                                                        ${item.statut === 'OUVERTE'
                                                            ? 'flex-1 bg-yellow-400 hover:bg-yellow-500 text-black'
                                                            : 'px-4 bg-blue-600 hover:bg-blue-700'
                                                        }`}
                                                    title={item.statut === 'OUVERTE' ? "Prendre en charge" : "Rouvrir le dossier"}
                                                >
                                                    {item.statut === 'OUVERTE' ? <><FaHourglassHalf /> Traiter</> : <><FaUndo /> Rouvrir</>}
                                                </button>
                                            )}

                                            {/* Bouton RÉSOUDRE */}
                                            {item.statut !== 'TRAITEE' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'TRAITEE')}
                                                    className="flex-1 btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none font-bold"
                                                    title="Marquer comme résolu"
                                                >
                                                    <FaCheck /> Résoudre
                                                </button>
                                            )}

                                            {/* Bouton REJETER */}
                                            {item.statut !== 'REJETEE' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'REJETEE')}
                                                    className="btn btn-sm btn-square bg-red-100 hover:bg-red-200 text-red-600 border-none"
                                                    title="Rejeter"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- MODALE DE CRÉATION --- */}
            <dialog ref={modalRef} id="create_modal" className="modal">
                <div className="modal-box !max-w-lg w-full !bg-white p-0 rounded-2xl shadow-2xl overflow-hidden scrollbar-hide">
                    <div className="bg-slate-900 p-6 text-white">
                        <h3 className="font-bold text-2xl flex items-center gap-2">
                            <FaPlus className="text-primary" /> Nouvelle Réclamation
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Détaillez l'incident pour une prise en charge rapide.</p>
                    </div>

                    <form onSubmit={handleCreate} className="p-8 space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Type d'incident</label>
                            <select
                                className="select w-full p-4 bg-white border-2 border-gray-400 focus:border-primary text-gray-900 text-base h-auto"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">-- Sélectionner une catégorie --</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Lieu précis</label>
                            <input
                                type="text"
                                placeholder="Ex: 12 Rue de Paris, Centre-Ville"
                                className="input w-full p-4 bg-white border-2 border-gray-400 focus:border-primary text-gray-900 text-base h-auto placeholder-gray-500"
                                required
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Description</label>
                            <textarea
                                className="textarea w-full h-32 bg-white border-2 border-gray-400 focus:border-primary text-gray-900 text-base placeholder-gray-500 leading-normal p-4"
                                placeholder="Décrivez la situation en quelques mots..."
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                className="flex-1 btn bg-gray-200 text-black border border-gray-400 hover:bg-gray-300 font-bold h-12"
                                onClick={() => modalRef.current.close()}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn btn-primary shadow-lg text-black border border-gray-500 font-bold h-12"
                            >
                                Envoyer le signalement
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
};

export default Citizen;