# 🏙️ Smart City Services Platform

## 📖 Description
Plateforme d'orchestration de services urbains hétérogènes. Ce projet unifie l'accès à des services de mobilité, santé et environnement via une architecture microservices distribuée.

## 🏗️ Architecture Technique
Le projet suit une architecture **Microservices** avec les composants suivants :

### Backend
* **Auth Service** (Java/Spring Boot) : Sécurité JWT.
* **Mobility Service** (Java/Spring Boot) : API REST pour les transports.
* **Air Quality Service** (Java/JAX-WS) : Service SOAP simulé.
* **Emergency Service** (Python/gRPC) : Gestion critique haute performance.
* **Citizen Service** (Node.js/GraphQL) : Aggregation de données.
* **Orchestrator** (Java/Spring Boot) : Logique métier transverse.

### Infrastructure & Frontend
* **API Gateway** (Spring Cloud Gateway) : Point d'entrée unique.
* **Web Client** (React.js) : Dashboard utilisateur.
* **Monitoring** : Prometheus & Grafana.

## 🚀 Pré-requis
* Docker & Docker Compose
* Java 17+ (JDK)
* Node.js 18+
* Python 3.9+

## 🔧 Installation Rapide
```bash
# Lancer toute la stack
docker-compose up -d --build