import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    FaCloudSun, FaCar, FaExclamationTriangle, FaCheckCircle,
    FaTemperatureHigh, FaWind, FaAmbulance, FaChartLine, FaBolt
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

// Enregistrement des composants graphiques
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const { user } = useAuth();

    // États pour les données
    const [airData, setAirData] = useState(null);
    const [trafficStatus, setTrafficStatus] = useState(null);
    const [ticketStats, setTicketStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier si Admin ou Maire
    const isAdminOrMaire = user?.role === 'ADMIN' || user?.role === 'MAIRE';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Météo / Air (Pour tout le monde)
                const airRes = await api.get('/api/orchestrator/air?zone=Tunis');
                setAirData(airRes.data);

                // 2. Trafic (Pour tout le monde)
                const trafficRes = await api.get('/api/mobility/status');
                setTrafficStatus(trafficRes.data);

                // 3. Stats Tickets (Seulement si Admin/Maire)
                if (isAdminOrMaire) {
                    const statsRes = await api.get('/api/citizen/reclamations/stats');
                    setTicketStats(statsRes.data);
                }
            } catch (error) {
                console.error("Erreur chargement dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- Configuration du Graphique (Admin) ---
    const chartData = {
        labels: ['Ouvertes', 'En Cours', 'Traitées'],
        datasets: [
            {
                data: ticketStats
                    ? [ticketStats.OUVERTE || 0, ticketStats.EN_COURS || 0, ticketStats.TRAITEE || 0]
                    : [0, 0, 0],
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: { size: 12 }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">

            {/* --- EN-TÊTE --- */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Bonjour, <span className="text-slate-900">{user?.nomComplet || user?.username}</span> 👋
                        </h1>
                        <p className="text-gray-600">Voici un aperçu de la situation à Tunis aujourd'hui</p>
                    </div>

                    {/* Bouton SOS */}
                    <button
                        onClick={() => document.getElementById('sos_modal').showModal()}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 
                                 rounded-lg font-semibold shadow-lg transition-all animate-pulse"
                    >
                        <FaAmbulance className="text-lg" />
                        <span>SOS URGENCE</span>
                    </button>
                </div>
            </div>

            {/* --- WIDGETS PRINCIPAUX --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Widget Qualité de l'Air */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                        <div className="flex items-center gap-2 text-white">
                            <FaCloudSun className="text-2xl" />
                            <h3 className="font-bold text-lg">Qualité de l'Air</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        {airData ? (
                            <>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Indice AQI</p>
                                        <span className="text-4xl font-bold text-gray-900">{airData.indexAQI}</span>
                                    </div>
                                    <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${airData.niveau === 'BON'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {airData.niveau}
                                    </span>
                                </div>

                                <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <FaWind className="text-gray-400" /> CO2
                                        </span>
                                        <span className="font-semibold text-gray-900">{airData.tauxCO2}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <FaTemperatureHigh className="text-gray-400" /> Zone
                                        </span>
                                        <span className="font-semibold text-gray-900">{airData.zone}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Données indisponibles</p>
                        )}
                    </div>
                </div>

                {/* 2. Widget Trafic */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                        <div className="flex items-center gap-2 text-white">
                            <FaCar className="text-2xl" />
                            <h3 className="font-bold text-lg">Info Trafic</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        {trafficStatus ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">État du trafic</p>
                                        <span className="text-2xl font-bold text-gray-900">{trafficStatus.etat}</span>
                                    </div>
                                    {trafficStatus.etat === 'FLUIDE'
                                        ? <FaCheckCircle className="text-green-500 text-4xl" />
                                        : <FaExclamationTriangle className="text-orange-500 text-4xl" />
                                    }
                                </div>

                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{trafficStatus.message}</p>

                                <div className="border-t-2 border-gray-300 pt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Incidents signalés</span>
                                        <span className="font-bold text-lg text-gray-900">{trafficStatus.incidentsSignales || 0}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Chargement...</p>
                        )}
                    </div>
                </div>

                {/* 3. Widget Actions Rapides */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-sm overflow-hidden text-white">
                    <div className="p-6">
                        <h3 className="font-bold text-xl mb-3">Actions Rapides</h3>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            Besoin de signaler un incident ou de vérifier un trajet ?
                        </p>

                        <div className="space-y-3">
                            <Link
                                to="/citizen"
                                className="block w-full bg-white text-slate-900 py-3 rounded-lg font-semibold 
                                         text-center hover:bg-gray-100 transition-all"
                            >
                                Signaler un problème
                            </Link>
                            <Link
                                to="/mobility"
                                className="block w-full bg-slate-800 border-2 border-white text-white py-3 rounded-lg 
                                         font-semibold text-center hover:bg-slate-700 transition-all"
                            >
                                Horaires transports
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION ADMIN (GRAPHIQUES) --- */}
            {isAdminOrMaire && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Graphique Réclamations */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <FaChartLine className="text-slate-900 text-xl" />
                            <h2 className="font-bold text-xl text-gray-900">Statistiques Réclamations</h2>
                        </div>

                        <div className="h-64 flex items-center justify-center">
                            {ticketStats ? (
                                <Doughnut data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-gray-500">Aucune donnée disponible</p>
                            )}
                        </div>

                        {ticketStats && (
                            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-300">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{ticketStats.OUVERTE || 0}</p>
                                    <p className="text-xs text-gray-600 mt-1">Ouvertes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">{ticketStats.EN_COURS || 0}</p>
                                    <p className="text-xs text-gray-600 mt-1">En cours</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{ticketStats.TRAITEE || 0}</p>
                                    <p className="text-xs text-gray-600 mt-1">Traitées</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Carte Énergie */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <FaBolt className="text-slate-900 text-xl" />
                            <h2 className="font-bold text-xl text-gray-900">Consommation Énergétique</h2>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Consultez les données de consommation énergétique par quartier et visualisez les tendances.
                        </p>

                        <div className="flex items-center justify-center h-32">
                            <Link
                                to="/energy"
                                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold 
                                         hover:bg-slate-800 transition-all shadow-md"
                            >
                                Voir le Dashboard Énergie
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALE SOS --- */}
            <dialog id="sos_modal" className="modal">
                <div className="modal-box bg-white max-w-md">
                    <h3 className="font-bold text-2xl text-red-600 flex items-center gap-3 mb-4">
                        <FaAmbulance className="text-3xl" />
                        <span>URGENCE</span>
                    </h3>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        Cette fonctionnalité enverra votre position actuelle aux services d'urgence.
                        Confirmez-vous cette action ?
                    </p>

                    <div className="flex gap-3">
                        <Link
                            to="/sos"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg 
                                     font-semibold text-center transition-all"
                        >
                            OUI, LANCER L'ALERTE
                        </Link>
                        <button
                            onClick={() => document.getElementById('sos_modal').close()}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg 
                                     font-semibold transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
};

export default Dashboard;