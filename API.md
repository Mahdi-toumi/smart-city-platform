# 🌍 Documentation API – Smart City

**Base URL Gateway :** `http://localhost:8080`  
**Authentification :** JWT (Bearer Token)  
**Header obligatoire (sauf Public) :**  
`Authorization: Bearer <VOTRE_TOKEN>`

---

# 1️⃣ Service Authentification (Gestion Utilisateurs)

Permet l'inscription, la connexion et la gestion des droits.

| Méthode | Endpoint                   | Rôle        | Description / Usage Front |
|--------|----------------------------|-------------|----------------------------|
| POST   | `/auth/register`          | 🔓 Public   | Page Inscription. **Body :** `{ "username": "...", "password": "...", "email": "...", "nomComplet": "..." }` |
| POST   | `/auth/token`             | 🔓 Public   | Page Login. **Body :** `{ "username": "...", "password": "..." }` → Retourne `{ "token": "..." }` |
| GET    | `/auth/me`                | 👤 Connecté | Au chargement (App.js). Donne l'utilisateur connecté. |
| GET    | `/admin/users`            | 🛡️ Admin    | Dashboard Admin. Liste tous les utilisateurs. |
| PATCH  | `/admin/users/{id}/role`  | 🛡️ Admin    | Promotion. `?role=MAIRE` ou `?role=ADMIN`. |
| DELETE | `/admin/users/{id}`       | 🛡️ Admin    | Bannissement / suppression de compte. |

---

# 2️⃣ Smart Citizen (Réclamations)

Gestion des incidents urbains (Voirie, Déchets, etc.).

| Méthode | Endpoint                             | Rôle        | Description / Usage Front |
|--------|----------------------------------------|-------------|----------------------------|
| GET    | `/api/citizen/categories`             | 👤 Connecté | Formulaire : remplit le `<select>` (ex : `["VOIRIE","ECLAIRAGE"]`). |
| POST   | `/api/citizen/reclamations`           | 👤 Connecté | Créer un ticket. **Body :** `{ "type": "VOIRIE", "description": "...", "adresse": "..." }` |
| GET    | `/api/citizen/reclamations/me`        | 👤 Connecté | Page “Mes Réclamations”. `?citoyenId=...` |
| GET    | `/api/citizen/reclamations/stats`     | 🛡️ Admin/Maire | Stats pour graphiques (ex : `{ "OUVERTE": 10, "TRAITEE": 2 }`). |
| GET    | `/api/citizen/reclamations/all`       | 🛡️ Admin/Maire | Liste complète de la ville. |
| PATCH  | `/api/citizen/reclamations/{id}/status` | 🛡️ Admin/Maire | Modifier le statut (`?status=TRAITEE`). |

---

# 3️⃣ Smart Mobility (Transports)

Info trafic et gestion des trajets.

| Méthode | Endpoint                     | Rôle        | Description / Usage Front |
|--------|-------------------------------|-------------|----------------------------|
| GET    | `/api/mobility/status`       | 👤 Connecté | Widget Accueil — trafic actuel. |
| GET    | `/api/mobility/trajets`      | 👤 Connecté | Page Transports — liste complète. |
| GET    | `/api/mobility/trajets/filter` | 👤 Connecté | Filtre. `?status=PERTURBE` |
| GET    | `/api/mobility/types`        | 👤 Connecté | Formulaire Admin. Remplit `<select>` (BUS, METRO…). |
| POST   | `/api/mobility/trajets`      | 🛡️ Admin    | Créer une nouvelle ligne. |

---

# 4️⃣ Orchestrator (Urgences & Météo)

Façade pour services complexes (gRPC/SOAP).

| Méthode | Endpoint                          | Rôle        | Description / Usage Front |
|--------|-----------------------------------|-------------|----------------------------|
| GET    | `/api/orchestrator/air`           | 👤 Connecté | Widget Météo. `?zone=Tunis` — qualité de l’air. |
| GET    | `/api/orchestrator/types-urgence` | 👤 Connecté | Modale SOS — liste des types. |
| POST   | `/api/orchestrator/sos`           | 👤 Connecté | **Bouton rouge**. Alerte. **Body :** `{ "type": "INCENDIE", "lat": 36.8, "lon": 10.1 }` |
| GET    | `/api/orchestrator/live/{id}`     | 👤 Connecté | Flux SSE — suivi ambulance. |
| GET    | `/api/orchestrator/history`       | 👤 Connecté | Historique des alertes. |

---

# 5️⃣ Smart Energy (GraphQL)

Endpoint unique pour les statistiques énergétiques.

**URL :** `http://localhost:8080/graphql`  
**Méthode :** POST

### A. Remplir le select (Quartiers)

```graphql
query {
  getQuartiers
}
```

### B. Comparer (pour graphiques)

```graphql
query {
  comparerQuartiers(quartier1: "Lac 1", quartier2: "Marsa") {
    total1
    total2
    message
  }
}
```