import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FaBolt, FaLeaf, FaHistory, FaBurn, FaTint,
    FaPlus, FaSave, FaExchangeAlt, FaChartLine, FaFilter
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Energy = () => {
    // --- ÉTATS ---
    const [quartiers, setQuartiers] = useState([]);

    // Comparateur
    const [selectedQ1, setSelectedQ1] = useState('');
    const [selectedQ2, setSelectedQ2] = useState('');
    const [comparisonData, setComparisonData] = useState(null);
    const [loadingCompare, setLoadingCompare] = useState(false);

    // Historique
    const [selectedHistoryQuartier, setSelectedHistoryQuartier] = useState('Centre-Ville');
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Filtre par Ressource
    const [filterResource, setFilterResource] = useState('ALL');

    // Création
    const [formMeasure, setFormMeasure] = useState({
        quartier: '',
        ressource: 'ELECTRICITE',
        valeur: ''
    });
    const [loadingAdd, setLoadingAdd] = useState(false);

    const modalRef = useRef(null);

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        fetchQuartiers();
        handleLoadHistory('Centre-Ville');
    }, []);

    const fetchQuartiers = async () => {
        try {
            const res = await api.post('/graphql', { query: `query { getQuartiers }` });
            setQuartiers(res.data.data.getQuartiers);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des quartiers");
        }
    };

    // --- 2. ACTION : AJOUTER MESURE ---
    const handleAddMeasure = async (e) => {
        e.preventDefault();
        setLoadingAdd(true);

        const mutation = `
            mutation {
                ajouterMesure(
                    quartier: "${formMeasure.quartier}", 
                    ressource: ${formMeasure.ressource}, 
                    valeur: ${parseFloat(formMeasure.valeur)}
                ) {
                    id
                }
            }
        `;

        try {
            await api.post('/graphql', { query: mutation });
            toast.success("Mesure enregistrée avec succès ! ⚡");
            modalRef.current.close();
            setFormMeasure({ quartier: '', ressource: 'ELECTRICITE', valeur: '' });
            fetchQuartiers();
            if (selectedHistoryQuartier === formMeasure.quartier) {
                handleLoadHistory(formMeasure.quartier);
            }
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement.");
        } finally {
            setLoadingAdd(false);
        }
    };

    // --- 3. ACTION : COMPARER ---
    const handleCompare = async () => {
        if (!selectedQ1 || !selectedQ2) return;
        setLoadingCompare(true);

        const query = `
            query {
                comparerQuartiers(quartier1: "${selectedQ1}", quartier2: "${selectedQ2}") {
                    quartier1, total1, quartier2, total2, difference, message
                }
            }
        `;

        try {
            const res = await api.post('/graphql', { query });
            setComparisonData(res.data.data.comparerQuartiers);
            toast.success("Comparaison effectuée !");
        } catch (err) {
            toast.error("Erreur lors de la comparaison");
        } finally {
            setLoadingCompare(false);
        }
    };

    // --- 4. ACTION : CHARGER HISTORIQUE ---
    const handleLoadHistory = async (quartier) => {
        setSelectedHistoryQuartier(quartier);
        if (!quartier) {
            setHistoryData([]);
            return;
        }
        setLoadingHistory(true);
        const query = `
            query {
                getHistorique(quartier: "${quartier}") {
                    id, typeRessource, valeur, timestamp
                }
            }
        `;
        try {
            const res = await api.post('/graphql', { query });
            setHistoryData(res.data.data.getHistorique);
        } catch (err) {
            if (quartier !== 'Centre-Ville') {
                toast.error("Impossible de charger l'historique");
            }
        } finally {
            setLoadingHistory(false);
        }
    };

    // --- LOGIQUE DE FILTRAGE ---
    const filteredHistory = historyData.filter(item => {
        if (filterResource === 'ALL') return true;
        return item.typeRessource === filterResource;
    });

    // --- HELPERS ---
    const getResourceIcon = (type) => {
        switch (type) {
            case 'ELECTRICITE': return <FaBolt className="text-yellow-500" />;
            case 'EAU': return <FaTint className="text-blue-500" />;
            case 'GAZ': return <FaBurn className="text-orange-500" />;
            default: return <FaLeaf />;
        }
    };

    const getResourceColor = (type) => {
        switch (type) {
            case 'ELECTRICITE': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'EAU': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'GAZ': return 'bg-orange-100 text-orange-800 border border-orange-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Chart Data
    const chartData = {
        labels: [comparisonData?.quartier1 || '', comparisonData?.quartier2 || ''],
        datasets: [{
            label: 'Consommation Totale',
            data: [comparisonData?.total1 || 0, comparisonData?.total2 || 0],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: function (context) {
                        return `Consommation: ${context.parsed.y} kWh/m³`;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
            x: { grid: { display: false } }
        }
    };

    // Stats rapides
    const totalMeasures = historyData.length;
    const electriciteCount = historyData.filter(h => h.typeRessource === 'ELECTRICITE').length;
    const eauCount = historyData.filter(h => h.typeRessource === 'EAU').length;
    const gazCount = historyData.filter(h => h.typeRessource === 'GAZ').length;

    return (
        <div className="fade-in space-y-8 p-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white shadow-md">
                                <FaBolt className="text-2xl" />
                            </div>
                            Smart Energy
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Supervision énergétique et gestion des ressources.</p>
                    </div>

                    <button
                        className="btn btn-primary px-6 py-3 rounded-lg font-bold shadow-lg flex items-center text-black border border-gray-800 hover:scale-105 transition-transform"
                        onClick={() => modalRef.current.showModal()}
                    >
                        <FaPlus className="mr-2" /> Ajouter une mesure
                    </button>
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-purple-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Total Mesures</p><p className="text-4xl font-extrabold text-gray-900 mt-1">{totalMeasures}</p></div>
                    <div className="p-4 bg-purple-100 rounded-full border border-purple-200"><FaChartLine className="text-3xl text-purple-600" /></div>
                </div>
                {/* Élec */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-yellow-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Électricité</p><p className="text-4xl font-extrabold text-yellow-600 mt-1">{electriciteCount}</p></div>
                    <div className="p-4 bg-yellow-100 rounded-full border border-yellow-200"><FaBolt className="text-3xl text-yellow-600" /></div>
                </div>
                {/* Eau */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-blue-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Eau</p><p className="text-4xl font-extrabold text-blue-600 mt-1">{eauCount}</p></div>
                    <div className="p-4 bg-blue-100 rounded-full border border-blue-200"><FaTint className="text-3xl text-blue-600" /></div>
                </div>
                {/* Gaz */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 border-l-8 border-l-orange-500 p-6 flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-gray-500 uppercase">Gaz</p><p className="text-4xl font-extrabold text-orange-600 mt-1">{gazCount}</p></div>
                    <div className="p-4 bg-orange-100 rounded-full border border-orange-200"><FaBurn className="text-3xl text-orange-600" /></div>
                </div>
            </div>

            {/* COMPARATEUR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <FaExchangeAlt className="text-blue-500" /> Comparateur de Quartiers
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Quartier A</label>
                            {/* AJOUT DE p-4 */}
                            <select className="select w-full p-4 bg-white border border-gray-300 focus:border-blue-500 text-gray-900 h-12 font-medium"
                                value={selectedQ1} onChange={(e) => setSelectedQ1(e.target.value)}>
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-center pb-2"><div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">VS</div></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Quartier B</label>
                            {/* AJOUT DE p-4 */}
                            <select className="select w-full p-4 bg-white border border-gray-300 focus:border-blue-500 text-gray-900 h-12 font-medium"
                                value={selectedQ2} onChange={(e) => setSelectedQ2(e.target.value)}>
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* SUPPRESSION DE L'ICÔNE FaChartBar */}
                    <button className="btn w-full md:w-auto px-8 bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md mx-auto block"
                        onClick={handleCompare} disabled={!selectedQ1 || !selectedQ2 || loadingCompare}>
                        {loadingCompare ? <><span className="loading loading-spinner loading-sm"></span> Comparaison...</> : "Comparer les données"}
                    </button>
                    {comparisonData && (
                        <div className="mt-8 border-t border-gray-200 pt-8 animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="h-64"><Bar options={chartOptions} data={chartData} /></div>
                                </div>
                                <div className="space-y-4 flex flex-col justify-center">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                        <div className="flex items-start gap-3"><FaLeaf className="text-green-600 text-2xl mt-1" />
                                            <div><p className="font-bold text-green-900 mb-1">Analyse</p><p className="text-sm text-green-800 leading-relaxed">{comparisonData.message}</p></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Écart constaté</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-black text-gray-900">{Math.abs(comparisonData.difference).toFixed(0)}</p>
                                            <span className="text-sm text-gray-500 font-medium">kWh/m³</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION HISTORIQUE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden flex flex-col h-[500px]">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        Historique des Mesures
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* Filtre Ressource (PLUS LARGE w-48) */}
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400 text-sm" />
                            <select
                                className="select p-2 select-sm w-48 bg-white border border-gray-300 focus:border-slate-900 text-gray-700 font-medium"
                                value={filterResource}
                                onChange={(e) => setFilterResource(e.target.value)}
                            >
                                <option value="ALL">Toutes les ressources</option>
                                <option value="ELECTRICITE">⚡ Électricité</option>
                                <option value="EAU">💧 Eau</option>
                                <option value="GAZ">🔥 Gaz</option>
                            </select>
                        </div>

                        {/* Filtre Quartier (PLUS LARGE w-64) */}
                        <select
                            className="select select-sm p-2 w-64 bg-white border border-gray-300 focus:border-slate-900 text-gray-700 font-medium"
                            value={selectedHistoryQuartier}
                            onChange={(e) => handleLoadHistory(e.target.value)}
                        >
                            <option value="">-- Quartier --</option>
                            {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-auto flex-1 p-0">
                    <table className="table table-pin-rows w-full">
                        <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase sticky top-0 z-10">
                            <tr>
                                <th className="bg-gray-50">Date</th>
                                <th className="bg-gray-50">Ressource</th>
                                <th className="bg-gray-50 text-right">Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingHistory ? (
                                <tr><td colSpan="3" className="text-center py-20"><span className="loading loading-spinner loading-lg text-slate-300"></span></td></tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-20 text-gray-400">Aucune donnée trouvée pour ce filtre</td></tr>
                            ) : (
                                filteredHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                        <td className="font-mono text-xs text-gray-500">{new Date(parseInt(item.timestamp)).toLocaleString('fr-FR')}</td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm ${getResourceColor(item.typeRessource)}`}>
                                                {getResourceIcon(item.typeRessource)} {item.typeRessource}
                                            </span>
                                        </td>
                                        <td className="text-right font-bold text-gray-900">
                                            {item.valeur} <span className="text-xs font-normal text-gray-400 ml-1">{item.typeRessource === 'ELECTRICITE' ? 'kWh' : 'm³'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE D'AJOUT */}
            <dialog ref={modalRef} id="add_modal" className="modal">
                <div className="modal-box !max-w-lg w-full !bg-white p-0 rounded-2xl shadow-2xl overflow-hidden scrollbar-hide">
                    <div className="bg-slate-900 p-6 text-white">
                        <h3 className="font-bold text-2xl flex items-center gap-2"><FaSave className="text-primary" /> Ajouter un relevé</h3>
                        <p className="text-slate-400 text-sm mt-1">Enregistrez une nouvelle consommation manuellement.</p>
                    </div>
                    <form onSubmit={handleAddMeasure} className="p-8 space-y-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Quartier</label>
                            {/* AJOUT DE p-4 */}
                            <select className="select w-full p-4 bg-white border-2 border-gray-300 focus:border-slate-900 text-gray-900 h-12 font-medium"
                                required value={formMeasure.quartier} onChange={(e) => setFormMeasure({ ...formMeasure, quartier: e.target.value })}>
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                                <option value="Nouveau Quartier">+ Nouveau (Simulation)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Type de Ressource</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['ELECTRICITE', 'EAU', 'GAZ'].map(type => (
                                    <button type="button" key={type}
                                        className={`py-3 rounded-lg font-bold text-sm transition-all flex flex-col items-center gap-1 border-2 ${formMeasure.ressource === type ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                        onClick={() => setFormMeasure({ ...formMeasure, ressource: type })}>
                                        <span className="text-lg">{type === 'ELECTRICITE' && <FaBolt />}{type === 'EAU' && <FaTint />}{type === 'GAZ' && <FaBurn />}</span>{type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Valeur relevée</label>
                            <div className="relative">
                                {/* AJOUT DE p-4 */}
                                <input type="number" className="input w-full p-4 bg-white border-2 border-gray-300 focus:border-slate-900 text-gray-900 h-12 font-bold text-lg pr-16"
                                    placeholder="0.00" required min="0" step="0.01" value={formMeasure.valeur} onChange={(e) => setFormMeasure({ ...formMeasure, valeur: e.target.value })} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{formMeasure.ressource === 'ELECTRICITE' ? 'kWh' : 'm³'}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" className="flex-1 btn bg-gray-200 text-black border border-gray-400 hover:bg-gray-300 font-bold h-12" onClick={() => modalRef.current.close()}>Annuler</button>
                            <button type="submit" className="flex-1 btn btn-primary shadow-lg text-black border border-gray-800 font-bold h-12" disabled={loadingAdd}>
                                {loadingAdd ? <span className="loading loading-spinner"></span> : "Sauvegarder"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

        </div>
    );
};

export default Energy;