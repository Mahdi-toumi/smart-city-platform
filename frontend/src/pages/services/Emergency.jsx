import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import {
    FaAmbulance, FaMapMarkerAlt, FaClock, FaExclamationTriangle,
    FaCheckCircle, FaHistory
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
        <div className="fade-in space-y-6 h-[calc(100vh-120px)]">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white">
                                <FaAmbulance className="text-2xl" />
                            </div>
                            Service d'Urgence
                        </h1>
                        <p className="text-gray-600 mt-2">Alertez les secours et suivez leur arrivée en temps réel</p>
                    </div>

                    {activeAlertId && (
                        <div className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold 
                                      flex items-center gap-2 animate-pulse">
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            ALERTE ACTIVE
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENU PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100% - 120px)' }}>

                {/* --- COLONNE GAUCHE : CARTE (2/3) --- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden relative">
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
                        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg 
                                      border-2 border-gray-300 w-80 z-[1000] overflow-hidden">
                            {/* En-tête avec gradient rouge */}
                            <div className="bg-gradient-to-r from-red-600 to-red-500 p-4">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    SECOURS EN ROUTE
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-semibold">Statut</span>
                                    <span className="text-gray-900 font-bold">{liveStatus}</span>
                                </div>

                                {eta !== null && eta > 0 && (
                                    <div className="border-t-2 border-gray-300 pt-4">
                                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                            <FaClock /> Temps d'arrivée estimé
                                        </p>
                                        <div className="text-5xl font-bold text-red-600 text-center">
                                            {eta} min
                                        </div>
                                    </div>
                                )}

                                {eta !== null && eta <= 0 && (
                                    <div className="bg-green-100 text-green-700 p-4 rounded-lg 
                                                  font-bold text-center flex items-center justify-center gap-2">
                                        <FaCheckCircle className="text-2xl" />
                                        ARRIVÉE !
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- COLONNE DROITE : FORMULAIRE & HISTORIQUE (1/3) --- */}
                <div className="flex flex-col gap-6 overflow-y-auto">

                    {/* FORMULAIRE SOS */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-red-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 p-4">
                            <h2 className="font-bold text-xl text-white flex items-center gap-2">
                                <FaExclamationTriangle />
                                LANCER ALERTE
                            </h2>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSos} className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                        Type d'urgence *
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                                 focus:border-red-500 focus:outline-none transition-all"
                                        required
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 font-semibold mb-2 block">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900
                                                 focus:border-red-500 focus:outline-none transition-all h-24"
                                        placeholder="Détails de l'urgence..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-yellow-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-yellow-800 font-semibold">
                                                Position détectée
                                            </p>
                                            <p className="text-xs text-yellow-700">
                                                Tunis Centre ({myPosition[0].toFixed(4)}, {myPosition[1].toFixed(4)})
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-bold 
                                             text-lg hover:bg-red-700 transition-all shadow-lg
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2"
                                    disabled={loadingSOS || activeAlertId}
                                >
                                    {loadingSOS ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent 
                                                          rounded-full animate-spin"></div>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaAmbulance className="text-xl" />
                                            SOS - ENVOYER SECOURS
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* HISTORIQUE */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 flex-1 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-4">
                            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                                <FaHistory />
                                Historique
                            </h2>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-80">
                            {history.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaHistory className="text-4xl text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Aucune alerte passée</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((h, i) => (
                                        <div key={i}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg 
                                                      border-2 border-gray-200 hover:border-gray-300 transition-all">
                                            <div className="bg-red-100 text-red-600 p-2 rounded-full flex-shrink-0">
                                                <FaAmbulance />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm text-gray-900">{h.type}</div>
                                                <div className="text-xs text-gray-600 truncate">{h.description}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(h.dateCreation).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
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