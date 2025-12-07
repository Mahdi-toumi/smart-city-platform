import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FaBolt, FaChartBar, FaLeaf, FaHistory, FaBurn, FaTint,
    FaPlus, FaSave, FaExchangeAlt, FaCalendarAlt, FaChartLine
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
    const [selectedHistoryQuartier, setSelectedHistoryQuartier] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Création
    const [formMeasure, setFormMeasure] = useState({
        quartier: '',
        ressource: 'ELECTRICITE',
        valeur: ''
    });
    const [loadingAdd, setLoadingAdd] = useState(false);

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        fetchQuartiers();
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
            document.getElementById('add_modal').close();

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
            toast.error("Impossible de charger l'historique");
        } finally {
            setLoadingHistory(false);
        }
    };

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
            case 'ELECTRICITE': return 'bg-yellow-100 text-yellow-700';
            case 'EAU': return 'bg-blue-100 text-blue-700';
            case 'GAZ': return 'bg-orange-100 text-orange-700';
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
            legend: {
                display: false
            },
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
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Stats rapides
    const totalMeasures = historyData.length;
    const electriciteCount = historyData.filter(h => h.typeRessource === 'ELECTRICITE').length;
    const eauCount = historyData.filter(h => h.typeRessource === 'EAU').length;
    const gazCount = historyData.filter(h => h.typeRessource === 'GAZ').length;

    return (
        <div className="fade-in space-y-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white">
                                <FaBolt className="text-2xl" />
                            </div>
                            Smart Energy
                        </h1>
                        <p className="text-gray-600 mt-2">Supervision énergétique et gestion des ressources</p>
                    </div>
                    <button
                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold 
                                 hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
                        onClick={() => document.getElementById('add_modal').showModal()}
                    >
                        <FaPlus /> Ajouter une mesure
                    </button>
                </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Mesures</p>
                            <p className="text-4xl font-bold text-gray-900">{totalMeasures}</p>
                        </div>
                        <div className="p-4 bg-purple-100 rounded-lg">
                            <FaChartLine className="text-3xl text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Électricité</p>
                            <p className="text-4xl font-bold text-yellow-600">{electriciteCount}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-lg">
                            <FaBolt className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Eau</p>
                            <p className="text-4xl font-bold text-blue-600">{eauCount}</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-lg">
                            <FaTint className="text-3xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Gaz</p>
                            <p className="text-4xl font-bold text-orange-600">{gazCount}</p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-lg">
                            <FaBurn className="text-3xl text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION COMPARATEUR */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                    <h2 className="font-bold text-xl text-white flex items-center gap-2">
                        <FaExchangeAlt />
                        Comparateur de Quartiers
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Quartier A
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                         focus:border-slate-900 focus:outline-none transition-all
                                         bg-white"
                                value={selectedQ1}
                                onChange={(e) => setSelectedQ1(e.target.value)}
                            >
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>

                        <div className="flex items-end justify-center pb-3">
                            <div className="text-3xl font-bold text-blue-500">VS</div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Quartier B
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                         focus:border-slate-900 focus:outline-none transition-all
                                         bg-white"
                                value={selectedQ2}
                                onChange={(e) => setSelectedQ2(e.target.value)}
                            >
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-lg 
                                 font-semibold hover:bg-slate-800 transition-all shadow-md
                                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                                 justify-center gap-2 mx-auto"
                        onClick={handleCompare}
                        disabled={!selectedQ1 || !selectedQ2 || loadingCompare}
                    >
                        {loadingCompare ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white border-t-transparent 
                                              rounded-full animate-spin"></div>
                                Comparaison...
                            </>
                        ) : (
                            <>
                                <FaChartBar /> Comparer
                            </>
                        )}
                    </button>

                    {comparisonData && (
                        <div className="mt-8 border-t-2 border-gray-300 pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <div className="h-80 bg-gray-50 rounded-lg p-4">
                                        <Bar options={chartOptions} data={chartData} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <FaLeaf className="text-green-600 text-2xl flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="font-bold text-green-900 mb-1">Résultat</p>
                                                <p className="text-sm text-green-700">{comparisonData.message}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-2">Différence</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {Math.abs(comparisonData.difference).toFixed(1)}
                                            <span className="text-sm font-normal text-gray-500 ml-2">kWh/m³</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION HISTORIQUE */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="font-bold text-xl text-white flex items-center gap-2">
                            <FaHistory />
                            Historique des Mesures
                        </h2>
                        <select
                            className="px-4 py-2 rounded-lg border-2 border-white/20 
                                     focus:border-white focus:outline-none transition-all
                                     bg-white text-gray-900 font-semibold"
                            value={selectedHistoryQuartier}
                            onChange={(e) => handleLoadHistory(e.target.value)}
                        >
                            <option value="">Tous les quartiers</option>
                            {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            Date & Heure
                                        </div>
                                    </th>
                                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">
                                        Ressource
                                    </th>
                                    <th className="text-right py-4 px-4 text-gray-600 font-semibold">
                                        Valeur
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent 
                                                              rounded-full animate-spin"></div>
                                                <p className="text-gray-600">Chargement...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : historyData.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12">
                                            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Aucune mesure disponible</p>
                                            <p className="text-gray-400 text-sm mt-2">
                                                Sélectionnez un quartier ou ajoutez une nouvelle mesure
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    historyData.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors
                                                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                        >
                                            <td className="py-4 px-4 font-mono text-sm text-gray-600">
                                                {new Date(parseInt(item.timestamp)).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-lg font-semibold text-sm 
                                                                flex items-center gap-2 w-fit
                                                                ${getResourceColor(item.typeRessource)}`}>
                                                    {getResourceIcon(item.typeRessource)}
                                                    {item.typeRessource}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {item.valeur}
                                                </span>
                                                <span className="text-sm font-normal text-gray-500 ml-2">
                                                    {item.typeRessource === 'ELECTRICITE' ? 'kWh' : 'm³'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {historyData.length > 0 && (
                        <div className="mt-4 text-right text-sm text-gray-500">
                            Total : {historyData.length} mesure{historyData.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALE D'AJOUT --- */}
            <dialog id="add_modal" className="modal">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <h3 className="font-bold text-2xl mb-4 text-gray-900 flex items-center gap-2">
                        <FaSave className="text-slate-900" />
                        Ajouter un relevé
                    </h3>
                    <form onSubmit={handleAddMeasure}>

                        {/* Quartier */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Quartier
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300  bg-white text-gray-900
                                         focus:border-slate-900 focus:outline-none transition-all
                                         bg-white"
                                required
                                value={formMeasure.quartier}
                                onChange={(e) => setFormMeasure({ ...formMeasure, quartier: e.target.value })}
                            >
                                <option value="">Sélectionner...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                                <option value="Nouveau Quartier">+ Nouveau (Simulation)</option>
                            </select>
                        </div>

                        {/* Ressource */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Type de Ressource
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['ELECTRICITE', 'EAU', 'GAZ'].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        className={`px-4 py-3 rounded-lg font-semibold transition-all
                                                  flex items-center justify-center gap-2
                                                  ${formMeasure.ressource === type
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        onClick={() => setFormMeasure({ ...formMeasure, ressource: type })}
                                    >
                                        {type === 'ELECTRICITE' && <FaBolt />}
                                        {type === 'EAU' && <FaTint />}
                                        {type === 'GAZ' && <FaBurn />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Valeur */}
                        <div className="mb-6">
                            <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                Valeur relevée
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 pr-16 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                             focus:border-slate-900 focus:outline-none transition-all
                                             bg-white"
                                    placeholder="ex: 150"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formMeasure.valeur}
                                    onChange={(e) => setFormMeasure({ ...formMeasure, valeur: e.target.value })}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 
                                               px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-semibold">
                                    {formMeasure.ressource === 'ELECTRICITE' ? 'kWh' : 'm³'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg 
                                         font-semibold hover:bg-gray-200 transition-all"
                                onClick={() => document.getElementById('add_modal').close()}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg 
                                         font-semibold hover:bg-slate-800 transition-all
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loadingAdd}
                            >
                                {loadingAdd ? "Enregistrement..." : "Sauvegarder"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-black bg-opacity-50">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
};

export default Energy;