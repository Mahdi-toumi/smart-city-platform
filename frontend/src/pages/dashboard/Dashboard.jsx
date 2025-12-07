import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    FaCloudSun, FaCar, FaExclamationTriangle, FaCheckCircle,
    FaTemperatureHigh, FaWind, FaAmbulance
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
                // On force "Tunis" pour l'exemple
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
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981'], // Rouge, Orange, Vert
                borderWidth: 1,
            },
        ],
    };

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="fade-in">
            {/* --- EN-TÊTE --- */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Bonjour, <span className="text-primary">{user?.nomComplet || user?.username}</span> 👋
                    </h1>
                    <p className="text-gray-500">Voici ce qui se passe à Tunis aujourd'hui.</p>
                </div>

                {/* Bouton SOS Rapide */}
                <button
                    onClick={() => document.getElementById('sos_modal').showModal()}
                    className="btn btn-error text-white gap-2 shadow-lg mt-4 md:mt-0 animate-pulse"
                >
                    <FaAmbulance /> SOS URGENCE
                </button>
            </div>

            {/* --- WIDGETS PRINCIPAUX (GRILLE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {/* 1. Widget Qualité de l'Air */}
                <div className="card bg-base-100 shadow-xl border-l-4 border-info">
                    <div className="card-body">
                        <h2 className="card-title text-info"><FaCloudSun /> Qualité de l'Air</h2>
                        {airData ? (
                            <div className="mt-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-bold">{airData.indexAQI}</span>
                                    <span className={`badge ${airData.niveau === 'BON' ? 'badge-success' : 'badge-warning'} badge-lg`}>
                                        {airData.niveau}
                                    </span>
                                </div>
                                <div className="divider my-2"></div>
                                <div className="text-sm text-gray-500 flex justify-between">
                                    <span className="flex items-center gap-1"><FaWind /> CO2: {airData.tauxCO2}</span>
                                    <span className="flex items-center gap-1"><FaTemperatureHigh /> Zone: {airData.zone}</span>
                                </div>
                            </div>
                        ) : <p>Données indisponibles</p>}
                    </div>
                </div>

                {/* 2. Widget Trafic */}
                <div className="card bg-base-100 shadow-xl border-l-4 border-warning">
                    <div className="card-body">
                        <h2 className="card-title text-warning"><FaCar /> Info Trafic</h2>
                        {trafficStatus ? (
                            <div className="mt-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold">{trafficStatus.etat}</span>
                                    {trafficStatus.etat === 'FLUIDE'
                                        ? <FaCheckCircle className="text-success text-3xl" />
                                        : <FaExclamationTriangle className="text-warning text-3xl" />
                                    }
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{trafficStatus.message}</p>
                                <div className="mt-4 text-xs text-right">Incidents signalés: {trafficStatus.incidentsSignales || 0}</div>
                            </div>
                        ) : <p>Chargement...</p>}
                    </div>
                </div>

                {/* 3. Widget Action Rapide (Citoyen) ou Résumé (Admin) */}
                <div className="card bg-primary text-primary-content shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Actions Rapides</h2>
                        <p>Besoin de signaler un incident ou de vérifier un trajet ?</p>
                        <div className="card-actions justify-end mt-4">
                            <Link to="/citizen" className="btn btn-sm btn-white text-primary">Signaler un problème</Link>
                            <Link to="/mobility" className="btn btn-sm btn-ghost border-white text-white">Horaires Bus</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION ADMIN (GRAPHIQUES) --- */}
            {isAdminOrMaire && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">📊 Statistiques Réclamations</h2>
                            <div className="h-64 flex justify-center">
                                {ticketStats ? (
                                    <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
                                ) : <p>Aucune donnée</p>}
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">⚡ Consommation Énergétique</h2>
                            <p className="text-gray-500">Comparaison rapide des quartiers</p>
                            <div className="flex items-center justify-center h-full">
                                <Link to="/energy" className="btn btn-outline btn-primary">Voir le Dashboard Énergie</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALE SOS (HIDDEN) --- */}
            <dialog id="sos_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error flex items-center gap-2">
                        <FaAmbulance /> URGENCE
                    </h3>
                    <p className="py-4">Cette fonctionnalité enverra votre position aux secours. Confirmez-vous ?</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* Le vrai formulaire SOS sera implémenté plus tard, ici c'est un lien vers la page SOS */}
                            <Link to="/sos" className="btn btn-error text-white mr-2">OUI, LANCER L'ALERTE</Link>
                            <button className="btn">Annuler</button>
                        </form>
                    </div>
                </div>
            </dialog>

        </div>
    );
};

export default Dashboard;