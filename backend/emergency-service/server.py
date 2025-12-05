import grpc
from concurrent import futures
import time
import random
import uuid
import logging

import urgences_pb2
import urgences_pb2_grpc

# --- Base de données en mémoire ---
# Stocke les urgences reçues.
# Format : { "id_123": { "req": request_obj, "status": "EN_COURS" } }
DB_URGENCES = {}

class UrgenceServiceServicer(urgences_pb2_grpc.UrgenceServiceServicer):
    
    # 1. SIGNALEMENT (Unary)
    def SignalerUrgence(self, request, context):
        id_intervention = str(uuid.uuid4())
        type_str = urgences_pb2.TypeUrgence.Name(request.type_urgence)
        
        print(f"  NOUVELLE ALERTE [{id_intervention}]")
        print(f"   Type : {type_str}")
        print(f"   GPS  : {request.position.latitude}, {request.position.longitude}")

        # Sauvegarde en mémoire (Historique)
        DB_URGENCES[id_intervention] = request

        return urgences_pb2.UrgenceResponse(
            id_intervention=id_intervention,
            prise_en_compte=True,
            message_status=f"Equipe en route vers {request.position.latitude}, {request.position.longitude}"
        )

    # 2. SUIVI TEMPS RÉEL (Server Streaming)
    def SuivreIntervention(self, request, context):
        intervention_id = request.id_intervention
        print(f"  Début du streaming pour l'intervention {intervention_id}")

        # Simulation du trajet de l'ambulance
        # On part d'un point arbitraire et on se rapproche
        lat_ambulance = 36.8000
        lon_ambulance = 10.1800
        temps_restant = 10 # minutes

        # La boucle simule le déplacement
        while temps_restant > 0:
            # Vérification si le client a coupé la connexion
            if not context.is_active():
                print("Client déconnecté du flux.")
                break

            # On simule le mouvement (GPS bouge)
            lat_ambulance += 0.001 
            lon_ambulance += 0.001
            temps_restant -= 2 # Le temps passe vite pour la démo
            
            # Création du message de mise à jour
            update = urgences_pb2.SuiviUpdate(
                position_actuelle_equipe=urgences_pb2.Coordonnees(
                    latitude=lat_ambulance,
                    longitude=lon_ambulance
                ),
                status_message="En déplacement rapide",
                temps_restant_min=temps_restant
            )

            # YIELD est la clé du streaming en Python !
            # Cela envoie le message au client sans fermer la fonction
            yield update
            
            # Pause pour simuler le temps réel
            time.sleep(2) 

        # Dernier message
        yield urgences_pb2.SuiviUpdate(
            position_actuelle_equipe=urgences_pb2.Coordonnees(latitude=lat_ambulance, longitude=lon_ambulance),
            status_message="  L'équipe est arrivée sur place !",
            temps_restant_min=0
        )

    # 3. HISTORIQUE
    def HistoriqueUrgences(self, request, context):
        print("  Demande d'historique reçue")
        all_urgences = list(DB_URGENCES.values())
        return urgences_pb2.HistoriqueResponse(urgences_passees=all_urgences)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    urgences_pb2_grpc.add_UrgenceServiceServicer_to_server(UrgenceServiceServicer(), server)
    server.add_insecure_port('[::]:50053')
    print("  Serveur Urgences (gRPC + Streaming) démarré sur le port 50053...")
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    logging.basicConfig()
    serve()