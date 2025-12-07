import { useEffect, useState } from 'react';
import api from '../../services/api'; // Notre client Axios configuré
import { FaBolt, FaSearch, FaChartBar, FaLeaf } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Configuration ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Energy = () => {
    const [quartiers, setQuartiers] = useState([]);
    const [selectedQ1, setSelectedQ1] = useState('');
    const [selectedQ2, setSelectedQ2] = useState('');
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- 1. CHARGER LA LISTE DES QUARTIERS (Query GraphQL) ---
    useEffect(() => {
        const fetchQuartiers = async () => {
            try {
                const query = `query { getQuartiers }`; // La requête GraphQL
                const res = await api.post('/graphql', { query });
                setQuartiers(res.data.data.getQuartiers);
            } catch (err) {
                console.error("Erreur chargement quartiers", err);
            }
        };
        fetchQuartiers();
    }, []);

    // --- 2. COMPARER (Query GraphQL avec paramètres) ---
    const handleCompare = async () => {
        if (!selectedQ1 || !selectedQ2) return;
        setLoading(true);

        // On construit la requête avec les variables
        const query = `
      query {
        comparerQuartiers(quartier1: "${selectedQ1}", quartier2: "${selectedQ2}") {
          quartier1
          total1
          quartier2
          total2
          difference
          message
        }
      }
    `;

        try {
            const res = await api.post('/graphql', { query });
            setComparisonData(res.data.data.comparerQuartiers);
        } catch (err) {
            alert("Erreur lors de la comparaison");
        } finally {
            setLoading(false);
        }
    };

    // --- CONFIGURATION DU GRAPHIQUE ---
    const chartData = {
        labels: [comparisonData?.quartier1, comparisonData?.quartier2],
        datasets: [
            {
                label: 'Consommation Totale (kWh)',
                data: [comparisonData?.total1, comparisonData?.total2],
                backgroundColor: ['#3B82F6', '#10B981'], // Bleu et Vert
                borderColor: ['#2563EB', '#059669'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Comparaison de la consommation énergétique' },
        },
    };

    return (
        <div className="fade-in max-w-5xl mx-auto">
            {/* HEADER */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800 flex justify-center items-center gap-3">
                    <FaBolt className="text-yellow-500" /> Smart Energy
                </h1>
                <p className="text-gray-500 mt-2">Analysez et optimisez la consommation énergétique des quartiers.</p>
            </div>

            {/* --- FORMULAIRE DE SÉLECTION --- */}
            <div className="card bg-base-100 shadow-xl mb-8">
                <div className="card-body">
                    <h2 className="card-title mb-4"><FaSearch /> Comparateur de Quartiers</h2>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="form-control w-full">
                            <label className="label">Quartier A</label>
                            <select
                                className="select select-bordered"
                                value={selectedQ1}
                                onChange={(e) => setSelectedQ1(e.target.value)}
                            >
                                <option value="">Choisir...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>

                        <div className="text-2xl font-bold text-gray-400 hidden md:block">VS</div>

                        <div className="form-control w-full">
                            <label className="label">Quartier B</label>
                            <select
                                className="select select-bordered"
                                value={selectedQ2}
                                onChange={(e) => setSelectedQ2(e.target.value)}
                            >
                                <option value="">Choisir...</option>
                                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary w-full md:w-auto"
                            onClick={handleCompare}
                            disabled={!selectedQ1 || !selectedQ2 || loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : "Comparer"}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- RÉSULTATS (Affiché seulement après comparaison) --- */}
            {comparisonData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* GRAPHIQUE */}
                    <div className="card bg-base-100 shadow-xl col-span-2">
                        <div className="card-body">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>

                    {/* KPI / RÉSUMÉ */}
                    <div className="flex flex-col gap-6">
                        <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
                            <div className="card-body">
                                <h2 className="card-title text-primary"><FaChartBar /> Résultat</h2>
                                <p className="text-lg font-medium mt-2">{comparisonData.message}</p>
                                <div className="divider"></div>
                                <div className="stat p-0">
                                    <div className="stat-title">Différence</div>
                                    <div className="stat-value text-secondary">{comparisonData.difference} <span className="text-sm">kWh</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-success text-success-content shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title"><FaLeaf /> Conseil Éco</h2>
                                <p>Le quartier <strong>{comparisonData.total1 < comparisonData.total2 ? comparisonData.quartier1 : comparisonData.quartier2}</strong> est le plus performant !</p>
                                <p className="text-sm opacity-80 mt-2">Pensez à éteindre les éclairages publics inutiles la nuit.</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Energy;