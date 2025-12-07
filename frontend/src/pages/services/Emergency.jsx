import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast'; // Import du Toast

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

    // 1. Charger les données initiales
    useEffect(() => {
        api.get('/api/orchestrator/types-urgence').then(res => setTypes(res.data));
        fetchHistory();
        return () => stopStream();
    }, []);

    const fetchHistory = () => {
        api.get(`/api/orchestrator/history?citoyenId=${user.username}`)
            .then(res => setHistory(res.data));
    };

    // 2. Lancer l'alerte (POST) avec TOAST
    const handleSos = async (e) => {
        e.preventDefault();
        setLoadingSOS(true);

        // Position fixe pour la démo (Tunis Centre)
        const myLat = 36.8065;
        const myLon = 10.1815;

        // On prépare la promesse de l'appel API
        const sosCall = api.post('/api/orchestrator/sos', {
            type: selectedType,
            description: description,
            latitude: myLat,
            longitude: myLon,
            citoyenId: user.username
        });

        // On enveloppe l'appel avec toast.promise
        toast.promise(sosCall, {
            loading: 'Transmission aux secours en cours...',
            success: 'ALERTE REÇUE ! Une unité est en route 🚑',
            error: 'Erreur de communication ! Appelez le 112.',
        })
            .then((res) => {
                // SI SUCCÈS : On lance le tracking
                const urgenceId = res.data.urgenceId;
                setActiveAlertId(urgenceId);
                setLiveStatus("Alerte reçue. Recherche d'une unité...");
                fetchHistory();

                // Démarrer le stream
                startLiveTracking(urgenceId);
            })
            .catch((err) => {
                console.error("Erreur SOS", err);
            })
            .finally(() => {
                setLoadingSOS(false);
            });
    };

    // 3. Suivre en temps réel (SSE via Fetch pour gérer le Token)
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
                            // Nettoyage robuste (avec ou sans espace)
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
        <div className="fade-in grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">

            {/* --- COLONNE GAUCHE : CARTE --- */}
            <div className="lg:col-span-2 bg-base-100 shadow-xl rounded-box overflow-hidden relative">
                <MapContainer center={[36.8065, 10.1815]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    <Marker position={[36.8065, 10.1815]}>
                        <Popup>Vous êtes ici (Alerte lancée)</Popup>
                    </Marker>

                    {ambulancePos && (
                        <>
                            <Marker position={ambulancePos} icon={new L.Icon({
                                iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893043.png',
                                iconSize: [40, 40]
                            })}>
                                <Popup>🚑 Ambulance en approche</Popup>
                            </Marker>
                            <RecenterMap lat={ambulancePos[0]} lon={ambulancePos[1]} />
                        </>
                    )}
                </MapContainer>

                {activeAlertId && (
                    <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-xl shadow-lg z-[1000] w-64 border-l-4 border-error backdrop-blur-sm">
                        <h3 className="font-bold text-error flex items-center gap-2">
                            <span className="loading loading-ring loading-sm"></span> SECOURS EN ROUTE
                        </h3>
                        <p className="text-sm font-semibold mt-1">{liveStatus}</p>
                        {eta !== null && eta > 0 && (
                            <div className="mt-2 text-2xl font-black text-gray-800">{eta} min</div>
                        )}
                        {eta <= 0 && <div className="mt-2 text-xl font-bold text-success">ARRIVÉE !</div>}
                    </div>
                )}
            </div>

            {/* --- COLONNE DROITE : FORMULAIRE & HISTORIQUE --- */}
            <div className="flex flex-col gap-6 overflow-y-auto">

                <div className="card bg-base-100 shadow-xl border-t-4 border-error">
                    <div className="card-body">
                        <h2 className="card-title text-error">🚨 LANCER ALERTE</h2>
                        <form onSubmit={handleSos}>
                            <div className="form-control w-full mb-3">
                                <label className="label">Type d'urgence</label>
                                <select
                                    className="select select-bordered select-error w-full"
                                    required
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="form-control w-full mb-4">
                                <textarea
                                    className="textarea textarea-bordered textarea-error"
                                    placeholder="Détails..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                className="btn btn-error text-white w-full animate-pulse font-bold text-lg"
                                disabled={loadingSOS || activeAlertId}
                            >
                                {loadingSOS ? "Envoi..." : "SOS - ENVOYER SECOURS"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl flex-1">
                    <div className="card-body">
                        <h2 className="card-title text-gray-600 text-sm uppercase tracking-wide">Historique</h2>
                        <div className="overflow-y-auto max-h-60 space-y-3">
                            {history.length === 0 && <p className="text-gray-400 text-sm">Aucune alerte passée.</p>}
                            {history.map((h, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-red-100 text-red-600 p-2 rounded-full text-xs font-bold">SOS</div>
                                    <div>
                                        <div className="font-bold text-sm">{h.type}</div>
                                        <div className="text-xs text-gray-500">{h.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Emergency;