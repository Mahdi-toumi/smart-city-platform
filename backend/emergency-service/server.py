import grpc
from concurrent import futures
import time
import logging
from bson.objectid import ObjectId

# Import des fichiers générés par Protobuf
import urgences_pb2
import urgences_pb2_grpc

# Import Database
from database import get_collection

# --- IMPLEMENTATION DU SERVICE ---
class UrgenceServiceServicer(urgences_pb2_grpc.UrgenceServiceServicer):
    
    def __init__(self):
        logging.info(" Initialisation du service Urgences...")
        try:
            self.collection = get_collection()
            logging.info(" Connexion à la base MongoDB réussie")
        except Exception as e:
            logging.error(f" Erreur de connexion MongoDB : {e}")
            raise e

    # 1. SIGNALER UNE URGENCE
    def SignalerUrgence(self, request, context):
        try:
            type_str = urgences_pb2.TypeUrgence.Name(request.type)
            logging.info(f" Nouvelle alerte reçue : {type_str} à ({request.position.latitude}, {request.position.longitude})")

            doc = {
                "type": type_str,
                "latitude": request.position.latitude,
                "longitude": request.position.longitude,
                "description": request.description,
                "citoyen_id": request.citoyen_id,
                "statut": "EN_ATTENTE",
                "timestamp": time.time()
            }

            result = self.collection.insert_one(doc)
            new_id = str(result.inserted_id)
            logging.info(f" Urgence insérée en base avec ID : {new_id}")

            return urgences_pb2.UrgenceResponse(
                id=new_id,
                prise_en_compte=True,
                message="Secours notifiés. Restez en sécurité.",
                statut=urgences_pb2.EN_ATTENTE
            )
        except Exception as e:
            logging.error(f" Erreur lors du signalement de l'urgence : {e}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return urgences_pb2.UrgenceResponse()

    # 2. STREAMING (Simulation temps réel)
    def SuivreIntervention(self, request, context):
        try:
            logging.info(f" Début du suivi pour l'urgence {request.id_urgence}")
            
            # Position de départ (Tunis)
            lat = 36.8065
            lon = 10.1815
            
            # Temps de trajet initial (en minutes)
            temps = 10  # On commence à 10 min pour que la démo ne soit pas trop longue

            # TANT QUE le temps n'est pas écoulé
            while temps > 0:
                if not context.is_active():
                    logging.warning(f" Client déconnecté pendant le streaming")
                    break

                # Simulation du déplacement (l'ambulance se rapproche du sud-est)
                lat -= 0.001 
                lon += 0.001 
                
                # On décrémente le temps
                temps -= 1

                # Création du message de mise à jour
                update = urgences_pb2.SuiviUpdate(
                    position_actuelle=urgences_pb2.Coordonnees(latitude=lat, longitude=lon),
                    message_status="Ambulance en route (Sirènes activées)",
                    temps_estime_arrivee=temps
                )

                logging.info(f" Update : ETA {temps} min - Pos ({lat:.4f}, {lon:.4f})")
                
                # Envoi au client (Java Orchestrator)
                yield update
                
                # Pause de 1 seconde pour accélérer la démo (au lieu de 2)
                time.sleep(1)

            # Une fois la boucle finie (temps = 0)
            yield urgences_pb2.SuiviUpdate(
                position_actuelle=urgences_pb2.Coordonnees(latitude=lat, longitude=lon),
                message_status="Ambulance arrivée sur les lieux !",
                temps_estime_arrivee=0
            )
            logging.info(f" Fin du suivi : Arrivée à destination.")

        except Exception as e:
            logging.error(f" Erreur pendant le streaming : {e}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)

            
    # 3. HISTORIQUE
    def HistoriqueUrgences(self, request, context):
        try:
            logging.info(f" Demande d'historique d'urgences pour citoyen_id={request.citoyen_id}")
            
            query = {}
            if request.citoyen_id:
                query["citoyen_id"] = request.citoyen_id

            docs = self.collection.find(query).limit(20)
            reponse_liste = []

            for doc in docs:
                try:
                    type_enum = urgences_pb2.TypeUrgence.Value(doc["type"])
                except Exception:
                    type_enum = urgences_pb2.INCONNU

                reponse_liste.append(urgences_pb2.UrgenceRequest(
                    type=type_enum,
                    position=urgences_pb2.Coordonnees(latitude=doc["latitude"], longitude=doc["longitude"]),
                    description=doc.get("description", ""),
                    citoyen_id=doc.get("citoyen_id", "")
                ))

            logging.info(f" Historique récupéré : {len(reponse_liste)} urgences")
            return urgences_pb2.HistoriqueResponse(urgences=reponse_liste)
        except Exception as e:
            logging.error(f" Erreur lors de la récupération de l'historique : {e}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return urgences_pb2.HistoriqueResponse()

# --- DEMARRAGE SERVEUR ---
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    urgences_pb2_grpc.add_UrgenceServiceServicer_to_server(UrgenceServiceServicer(), server)
    
    port = "50053"
    server.add_insecure_port(f'0.0.0.0:{port}')
    logging.info(f" Serveur Urgences (gRPC) démarré sur le port {port}")
    
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logging.info(" Arrêt du serveur gRPC")
        server.stop(0)

# --- MAIN ---
if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S"
    )
    logging.info("🔹 Lancement du serveur gRPC d'urgences...")

    # Vérification / insertion données de test
    try:
        collection = get_collection()
        if collection.count_documents({}) == 0:
            logging.info("🌱 Base vide : insertion de données de test...")
            collection.insert_one({
                "type": "ACCIDENT_ROUTE",
                "latitude": 36.8,
                "longitude": 10.1,
                "description": "Collision légère - Test Data",
                "statut": "TERMINE",
                "timestamp": time.time()
            })
            logging.info(" Données de test insérées")
    except Exception as e:
        logging.error(f" Impossible de vérifier/insérer les données : {e}")

    serve()
