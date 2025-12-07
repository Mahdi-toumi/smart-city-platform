import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import {
    FaAmbulance, FaMapMarkerAlt, FaClock, FaExclamationTriangle,
    FaCheckCircle, FaHistory, FaPhoneAlt
} from 'react-icons/fa';

// Correction des icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour recentrer la carte
const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon]);
    }, [lat, lon, map]);
    return null;
};

const Emergency = () => {
    const { user } = useAuth();
    const [types, setTypes] = useState([]);
    const [history, setHistory] = useState([]);

    // État Formulaire SOS
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [loadingSOS, setLoadingSOS] = useState(false);

    // État Live Tracking
    const [activeAlertId, setActiveAlertId] = useState(null);
    const [ambulancePos, setAmbulancePos] = useState(null);
    const [liveStatus, setLiveStatus] = useState("En attente d'alerte...");
    const [eta, setEta] = useState(null);

    // Référence pour arrêter le stream
    const streamReader = useRef(null);

    // Position fixe (Tunis Centre)
    const myPosition = [36.8065, 10.1815];

    // 1. Charger les données initiales
    useEffect(() => {
        api.get('/api/orchestrator/types-urgence').then(res => setTypes(res.data));
        fetchHistory();
        return () => stopStream();
    }, []);

    const fetchHistory = () => {
        api.get(`/api/orchestrator/history?citoyenId=${user.username}`)
            .then(res => setHistory(res.data))
            .catch(err => console.error("Erreur chargement historique", err));
    };

    const formatSafeDate = (dateString, type = 'time') => {
        if (!dateString) return type === 'time' ? "À l'instant" : "Aujourd'hui";

        const date = new Date(dateString);
        // Si la date est invalide (backend envoie null ou mauvais format)
        if (isNaN(date.getTime())) return type === 'time' ? "À l'instant" : "Aujourd'hui";

        if (type === 'time') {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    // 2. Lancer l'alerte (POST) avec TOAST
    const handleSos = async (e) => {
        e.preventDefault();
        setLoadingSOS(true);

        const [myLat, myLon] = myPosition;

        const sosCall = api.post('/api/orchestrator/sos', {
            type: selectedType,
            description: description,
            latitude: myLat,
            longitude: myLon,
            citoyenId: user.username
        });

        toast.promise(sosCall, {
            loading: 'Transmission aux secours en cours...',
            success: 'ALERTE REÇUE ! Une unité est en route 🚑',
            error: 'Erreur de communication ! Appelez le 112.',
        })
            .then((res) => {
                const urgenceId = res.data.urgenceId;
                setActiveAlertId(urgenceId);
                setLiveStatus("Alerte reçue. Recherche d'une unité...");
                fetchHistory();
                startLiveTracking(urgenceId);
            })
            .catch((err) => {
                console.error("Erreur SOS", err);
            })
            .finally(() => {
                setLoadingSOS(false);
            });
    };

    // 3. Suivre en temps réel (SSE via Fetch)
    const startLiveTracking = async (id) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8080/api/orchestrator/live/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const reader = response.body.getReader();
            streamReader.current = reader;
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data:')) {
                        try {
                            const jsonStr = trimmedLine.substring(5).trim();
                            if (!jsonStr) continue;

                            const data = JSON.parse(jsonStr);

                            setAmbulancePos([data.lat, data.lon]);
                            setLiveStatus(data.status);
                            setEta(data.eta);

                            if (data.eta <= 0) {
                                setLiveStatus("Ambulance Arrivée !");
                                toast.success("L'ambulance est arrivée sur les lieux !");
                                stopStream();
                            }
                        } catch (e) {
                            console.log("Stream parsing error", e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Stream error", err);
            toast.error("Perte de signal avec l'unité de secours");
        }
    };

    const stopStream = () => {
        if (streamReader.current) {
            streamReader.current.cancel();
            streamReader.current = null;
        }
    };

    return (
        <div className="fade-in space-y-6 min-h-screen pb-6 p-6">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-lg text-red-600 shadow-sm border border-red-200">
                                <FaAmbulance className="text-2xl" />
                            </div>
                            Service d'Urgence
                        </h1>
                        <p className="text-gray-500 mt-2 ml-1">Alertez les secours et suivez leur arrivée en temps réel.</p>
                    </div>

                    {activeAlertId ? (
                        <div className="px-6 py-3 bg-red-50 text-red-700 rounded-lg font-bold border border-red-200 
                                      flex items-center gap-3 shadow-sm animate-pulse">
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            ALERTE ACTIVE
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold border border-gray-200">
                            <FaPhoneAlt /> <span>Urgence vitale ? Appelez le 190</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENU PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>

                {/* --- COLONNE GAUCHE : CARTE (2/3) --- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden relative">
                    <MapContainer
                        center={myPosition}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        {/* Marqueur position utilisateur */}
                        <Marker position={myPosition}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold">Votre Position</p>
                                    <p className="text-sm text-gray-600">Alerte lancée ici</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Marqueur ambulance */}
                        {ambulancePos && (
                            <>
                                <Marker
                                    position={ambulancePos}
                                    icon={new L.Icon({
                                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893043.png',
                                        iconSize: [40, 40],
                                        iconAnchor: [20, 40]
                                    })}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-bold">🚑 Ambulance</p>
                                            <p className="text-sm text-gray-600">{liveStatus}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <RecenterMap lat={ambulancePos[0]} lon={ambulancePos[1]} />
                            </>
                        )}
                    </MapContainer>

                    {/* PANEL LIVE TRACKING (Sur la carte) */}
                    {activeAlertId && (
                        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-xl 
                                      border border-gray-800 w-80 z-[1000] overflow-hidden">
                            {/* En-tête */}
                            <div className="bg-red-600 p-4">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                    <span className="loading loading-spinner loading-sm text-white"></span>
                                    SECOURS EN ROUTE
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Statut Actuel</span>
                                    <span className="text-gray-900 font-bold text-lg leading-tight">{liveStatus}</span>
                                </div>

                                {eta !== null && eta > 0 && (
                                    <div className="border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <FaClock /> Temps estimé
                                            </p>
                                            <span className="text-3xl font-black text-red-600">
                                                {eta}<span className="text-sm font-normal text-gray-400 ml-1">min</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {eta !== null && eta <= 0 && (
                                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200
                                                  font-bold text-center flex items-center justify-center gap-2 animate-bounce">
                                        <FaCheckCircle className="text-2xl" />
                                        ARRIVÉE SUR LES LIEUX !
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- COLONNE DROITE : FORMULAIRE & HISTORIQUE (1/3) --- */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">

                    {/* FORMULAIRE SOS */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden flex-shrink-0">
                        <div className="bg-gray-50 p-4 border-b border-gray-300 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-500" />
                                Lancer une Alerte
                            </h2>
                        </div>

                        <div className="p-5">
                            <form onSubmit={handleSos} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                                        Type d'urgence *
                                    </label>
                                    <select
                                        className="select p-4 w-full bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 h-12"
                                        required
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                                        Description
                                    </label>
                                    <textarea
                                        className="textarea p-4 w-full bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 h-24"
                                        placeholder="Détails de l'urgence..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                                    <FaMapMarkerAlt className="text-yellow-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-yellow-800 uppercase">Position détectée</p>
                                        <p className="text-xs text-yellow-700 font-mono mt-0.5">
                                            {myPosition[0].toFixed(4)}, {myPosition[1].toFixed(4)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-full font-bold text-red-600 border border-red-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                    disabled={loadingSOS || activeAlertId}
                                >
                                    {loadingSOS ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaAmbulance className="text-lg" />
                                            ENVOYER SECOURS
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* HISTORIQUE (Scrollable) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-gray-50 p-4 border-b border-gray-300">
                            <h2 className="font-bold text-sm text-gray-600 uppercase flex items-center gap-2">
                                <FaHistory /> Historique
                            </h2>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {history.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <FaHistory className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-400 text-sm">Aucune alerte passée</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {history.map((h, i) => (
                                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                                            <div className="bg-red-50 text-red-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-red-100">
                                                <FaAmbulance />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-sm text-gray-900">{h.type}</p>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {formatSafeDate(h.dateCreation, 'time')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{h.description || "Pas de description"}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {formatSafeDate(h.dateCreation, 'date')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Emergency;