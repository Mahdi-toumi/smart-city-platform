import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    FaCloudSun, FaCar, FaExclamationTriangle, FaCheckCircle,
    FaTemperatureHigh, FaWind, FaAmbulance, FaChartLine, FaBolt, FaMapMarkerAlt
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
                // 1. Météo / Air
                const airRes = await api.get('/api/orchestrator/air?zone=Tunis');
                setAirData(airRes.data);

                // 2. Trafic
                const trafficRes = await api.get('/api/mobility/status');
                setTrafficStatus(trafficRes.data);

                // 3. Stats Tickets
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
        <div className="space-y-6 fade-in p-6">

            {/* --- EN-TÊTE --- */}
            {/* MODIFICATION ICI : border-gray-300 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Bonjour, <span className="text-slate-900 bg-slate-100 px-2 rounded-md">{user?.nomComplet || user?.username}</span> 👋
                        </h1>
                        <p className="text-gray-500">Voici un aperçu de la situation à Tunis aujourd'hui.</p>
                    </div>

                    {/* Bouton SOS */}
                    <button
                        onClick={() => document.getElementById('sos_modal').showModal()}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 
                                   rounded-lg font-semibold shadow-lg shadow-red-200 transition-all hover:scale-105 animate-pulse"
                    >
                        <FaAmbulance className="text-xl" />
                        <span>SOS URGENCE</span>
                    </button>
                </div>
            </div>

            {/* --- WIDGETS PRINCIPAUX --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Widget Qualité de l'Air & Météo */}
                {/* MODIFICATION ICI : border-gray-300 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                        <div className="flex items-center gap-2 text-white">
                            <FaCloudSun className="text-2xl" />
                            <h3 className="font-bold text-lg">Météo & Air</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        {airData ? (
                            <>
                                {/* Bloc Principal : AQI + Status */}
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1 font-semibold">Indice AQI</p>
                                        <span className="text-5xl font-extrabold text-slate-800 tracking-tight">{airData.indexAQI}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${airData.niveau === 'BON'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {airData.niveau}
                                        </span>
                                    </div>
                                </div>

                                {/* Détails : Température, CO2, Zone */}
                                <div className="space-y-3 pt-4 border-t border-gray-100">

                                    {/* TEMPÉRATURE */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-2 text-sm">
                                            <FaTemperatureHigh className="text-orange-500" /> Température
                                        </span>
                                        <span className="font-bold text-gray-900">24°C</span>
                                    </div>

                                    {/* CO2 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-2 text-sm">
                                            <FaWind className="text-blue-400" /> Taux CO2
                                        </span>
                                        <span className="font-semibold text-gray-900">{airData.tauxCO2} µg/m³</span>
                                    </div>

                                    {/* ZONE */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-red-400" /> Zone
                                        </span>
                                        <span className="font-semibold text-gray-900">Tunis</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Données indisponibles</p>
                        )}
                    </div>
                </div>

                {/* 2. Widget Trafic */}
                {/* MODIFICATION ICI : border-gray-300 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
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
                                        <p className="text-sm text-gray-500 mb-1 font-semibold">État Global</p>
                                        <span className="text-2xl font-bold text-gray-900">{trafficStatus.etat}</span>
                                    </div>
                                    {trafficStatus.etat === 'FLUIDE'
                                        ? <FaCheckCircle className="text-green-500 text-5xl opacity-90" />
                                        : <FaExclamationTriangle className="text-orange-500 text-5xl opacity-90" />
                                    }
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                    <p className="text-sm text-gray-700 leading-relaxed italic">"{trafficStatus.message}"</p>
                                </div>

                                <div className="flex justify-between items-center text-sm pt-2">
                                    <span className="text-gray-500">Incidents en cours</span>
                                    <span className="badge badge-neutral text-white font-bold">{trafficStatus.incidentsSignales || 0}</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Chargement...</p>
                        )}
                    </div>
                </div>

                {/* 3. Widget Actions Rapides (Widget sombre, pas de bordure grise nécessaire, l'ombre suffit) */}
                <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden text-white flex flex-col relative group hover:shadow-xl transition-all">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>

                    <div className="p-6 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-2xl mb-2">Actions Rapides</h3>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                            Accédez aux services essentiels en un clic.
                        </p>

                        <div className="space-y-3">
                            <Link
                                to="/citizen"
                                className="flex items-center justify-between w-full bg-white text-slate-900 py-4 px-6 rounded-lg font-bold 
                                           hover:bg-gray-100 hover:scale-[1.02] transition-all shadow-sm"
                            >
                                <span>Signaler un problème</span>
                                <FaExclamationTriangle className="text-orange-500" />
                            </Link>
                            <Link
                                to="/mobility"
                                className="flex items-center justify-between w-full bg-slate-800 border border-slate-700 text-white py-4 px-6 rounded-lg 
                                           font-bold hover:bg-slate-700 hover:border-slate-600 transition-all shadow-sm"
                            >
                                <span>Horaires transports</span>
                                <FaCar />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION ADMIN (GRAPHIQUES) --- */}
            {isAdminOrMaire && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Graphique Réclamations */}
                    {/* MODIFICATION ICI : border-gray-300 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <FaChartLine className="text-slate-900 text-xl" />
                            <h2 className="font-bold text-xl text-gray-900">Statistiques Réclamations</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="h-48 flex items-center justify-center">
                                {ticketStats ? (
                                    <Doughnut data={chartData} options={chartOptions} />
                                ) : (
                                    <p className="text-gray-500">Aucune donnée</p>
                                )}
                            </div>

                            {/* Légende détaillée à droite */}
                            <div className="space-y-4">
                                {ticketStats && (
                                    <>
                                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                            <span className="text-red-700 font-semibold text-sm">Ouvertes</span>
                                            <span className="text-xl font-bold text-red-800">{ticketStats.OUVERTE || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                            <span className="text-orange-700 font-semibold text-sm">En cours</span>
                                            <span className="text-xl font-bold text-orange-800">{ticketStats.EN_COURS || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                            <span className="text-green-700 font-semibold text-sm">Traitées</span>
                                            <span className="text-xl font-bold text-green-800">{ticketStats.TRAITEE || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Carte Énergie */}
                    {/* MODIFICATION ICI : border-gray-300 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <FaBolt className="text-slate-900 text-xl" />
                            <h2 className="font-bold text-xl text-gray-900">Consommation Énergétique</h2>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                <FaBolt className="text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Supervision des Quartiers</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                Visualisez les données de consommation (Eau, Gaz, Électricité) et comparez les performances énergétiques.
                            </p>
                            <Link
                                to="/energy"
                                className="btn btn-primary px-8 shadow-md"
                            >
                                Accéder au Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALE SOS --- */}
            <dialog id="sos_modal" className="modal">
                <div className="modal-box bg-white max-w-md border-t-8 border-red-600">
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
                                       font-semibold text-center transition-all shadow-lg shadow-red-200"
                        >
                            OUI, LANCER L'ALERTE
                        </Link>
                        <button
                            onClick={() => document.getElementById('sos_modal').close()}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg 
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