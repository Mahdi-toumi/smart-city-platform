import grpc
import time
import urgences_pb2
import urgences_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50053') as channel:
        stub = urgences_pb2_grpc.UrgenceServiceStub(channel)
        
        print("\n--- 1. SIGNALEMENT ---")
        # Création de la position GPS
        gps_accident = urgences_pb2.Coordonnees(latitude=36.8500, longitude=10.2000)
        
        req = urgences_pb2.UrgenceRequest(
            type_urgence=urgences_pb2.ACCIDENT_ROUTE,
            position=gps_accident,
            description="Collision sur autoroute"
        )
        
        response = stub.SignalerUrgence(req)
        print(f"  Reçu ID Intervention : {response.id_intervention}")
        intervention_id = response.id_intervention

        print("\n--- 2. STREAMING (SUIVI AMBULANCE) ---")
        suivi_req = urgences_pb2.SuiviRequest(id_intervention=intervention_id)
        
        # En gRPC, un stream se lit comme une boucle for
        for update in stub.SuivreIntervention(suivi_req):
            print(f"  [Update] Ambulance à ({update.position_actuelle_equipe.latitude:.4f}, {update.position_actuelle_equipe.longitude:.4f}) | Arrivée dans : {update.temps_restant_min} min")

        print("\n--- 3. HISTORIQUE ---")
        hist_resp = stub.HistoriqueUrgences(urgences_pb2.HistoriqueRequest())
        print(f"Total urgences enregistrées : {len(hist_resp.urgences_passees)}")
        for u in hist_resp.urgences_passees:
             print(f"- {urgences_pb2.TypeUrgence.Name(u.type_urgence)} à ({u.position.latitude}, {u.position.longitude})")

if __name__ == '__main__':
    run()