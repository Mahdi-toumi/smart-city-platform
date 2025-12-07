import { useEffect, useState, useRef } from 'react';
import api from '../../services/api'; // Notre client Axios
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CSS Leaflet obligatoire
import L from 'leaflet';

// Correction des icônes Leaflet qui buggent souvent avec React
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
        // Types d'urgence
        api.get('/api/orchestrator/types-urgence').then(res => setTypes(res.data));
        // Historique
        fetchHistory();

        // Cleanup stream on unmount
        return () => stopStream();
    }, []);

    const fetchHistory = () => {
        api.get(`/api/orchestrator/history?citoyenId=${user.username}`)
            .then(res => setHistory(res.data));
    };

    // 2. Lancer l'alerte (POST)
    const handleSos = async (e) => {
        e.preventDefault();
        setLoadingSOS(true);
        try {
            // Position fixe pour la démo (Tunis Centre)
            // Dans une vraie app mobile, on utiliserait navigator.geolocation
            const myLat = 36.8065;
            const myLon = 10.1815;

            const res = await api.post('/api/orchestrator/sos', {
                type: selectedType,
                description: description,
                latitude: myLat,
                longitude: myLon,
                citoyenId: user.username
            });

            const urgenceId = res.data.urgenceId;
            setActiveAlertId(urgenceId);
            setLiveStatus("Alerte reçue. Recherche d'une unité...");
            fetchHistory(); // Mettre à jour la liste

            // Démarrer le stream
            startLiveTracking(urgenceId);

        } catch (err) {
            alert("Erreur SOS");
        } finally {
            setLoadingSOS(false);
        }
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

                // On sépare par ligne car plusieurs updates peuvent arriver d'un coup
                const lines = chunk.split('\n');

                for (const line of lines) {
                    // On nettoie la ligne des espaces inutiles
                    const trimmedLine = line.trim();

                    // On vérifie si c'est bien une ligne de données SSE
                    if (trimmedLine.startsWith('data:')) {
                        try {
                            // 🛠️ CORRECTION ICI : 
                            // On enlève les 5 premiers caractères ("data:") peu importe s'il y a un espace après ou non
                            const jsonStr = trimmedLine.substring(5).trim();

                            // Si la ligne est vide (keep-alive), on ignore
                            if (!jsonStr) continue;

                            const data = JSON.parse(jsonStr);

                            // Mise à jour de l'interface
                            setAmbulancePos([data.lat, data.lon]);
                            setLiveStatus(data.status);
                            setEta(data.eta);

                            if (data.eta <= 0) {
                                setLiveStatus("Ambulance Arrivée !");
                                stopStream(); // Fin du tracking
                            }
                        } catch (e) {
                            console.log("Erreur parsing JSON sur ligne :", trimmedLine, e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Erreur Stream", err);
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

                    {/* Ma position (Fixe pour démo) */}
                    <Marker position={[36.8065, 10.1815]}>
                        <Popup>Vous êtes ici (Alerte lancée)</Popup>
                    </Marker>

                    {/* Ambulance (Mobile) */}
                    {ambulancePos && (
                        <>
                            <Marker position={ambulancePos} icon={new L.Icon({
                                iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893043.png', // Icone Ambulance
                                iconSize: [40, 40]
                            })}>
                                <Popup>🚑 Ambulance en approche</Popup>
                            </Marker>
                            <RecenterMap lat={ambulancePos[0]} lon={ambulancePos[1]} />
                        </>
                    )}
                </MapContainer>

                {/* Overlay Status Live */}
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

                {/* FORMULAIRE SOS */}
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
                                    placeholder="Détails (ex: blessé conscient...)"
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

                {/* HISTORIQUE */}
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