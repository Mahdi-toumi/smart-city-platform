# 🏙️ Smart City Services Platform

## 📖 Description
Plateforme d'orchestration de services urbains hétérogènes. Ce projet unifie l'accès à des services de mobilité, santé, énergie et citoyenneté via une architecture **Microservices Polyglotte**.

L'objectif est de démontrer l'interopérabilité entre différents protocoles (REST, SOAP, gRPC, GraphQL) et différentes technologies de persistance (SQL, NoSQL).

## 🏗️ Architecture Technique

Le projet suit une architecture distribuée stricte. Chaque microservice possède sa propre base de données et tourne dans un conteneur isolé.

### 📡 Services Backend (Couche Métier)

| Service | Techno | Protocole | Base de Données | Port | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Smart Mobility** | Java (Spring Boot) | **REST** | PostgreSQL | `8081` | Gestion des transports, trafic et itinéraires. |
| **2. Air Quality** | Java (Spring Boot) | **SOAP** | PostgreSQL | `8082` | Surveillance pollution (AQI, CO2) et historique. |
| **3. Smart Emergency** | Python | **gRPC** | MongoDB | `50053` | Gestion des crises temps réel et streaming GPS. |
| **4. Smart Energy** | Node.js | **GraphQL** | MongoDB | `4000` | Gestion consommation fluides (Eau, Elec, Gaz). |
| **5. Smart Citizen** | Java (Spring Boot) | **REST** | MySQL | `8083` | Gestion des réclamations et suivi citoyen. |

### 🧠 Orchestration & Sécurité (En cours)
* **Orchestrator** (Java/Spring Boot) : "Cerveau" qui gère les workflows inter-services.
* **Auth Service** (Java/Spring Boot) : Serveur d'authentification OAuth2/JWT.
* **API Gateway** (Spring Cloud Gateway) : Point d'entrée unique (`localhost:8080`).

### 💻 Frontend
* **Web Client** (React.js) : Dashboard de pilotage de la ville intelligente.

## 🚀 Pré-requis
* **Docker** & **Docker Compose** (Indispensable)
* **Java 17+** (Pour le développement local)
* **Node.js 18+**
* **Python 3.9+**

## 🔧 Installation & Démarrage

Le projet est entièrement conteneurisé.

1. **Cloner le projet**
2. **Lancer la stack complète :**
   ```bash
   docker-compose up -d --build
   ```
   Ou vous n’avez qu’à double-cliquer sur init.bat
