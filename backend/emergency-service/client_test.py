import grpc
import time
import urgences_pb2
import urgences_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50053') as channel:
        stub = urgences_pb2_grpc.UrgenceServiceStub(channel)
        
        print("\n--- 1. SIGNALEMENT ---")
        gps_accident = urgences_pb2.Coordonnees(latitude=36.8500, longitude=10.2000)
        
        req = urgences_pb2.UrgenceRequest(
            type=urgences_pb2.ACCIDENT_ROUTE,
            position=gps_accident,
            description="Collision sur autoroute"
        )
        
        response = stub.SignalerUrgence(req)
        print(f"  Reçu ID Intervention : {response.id}")
        intervention_id = response.id

        print("\n--- 2. STREAMING (SUIVI AMBULANCE) ---")
        suivi_req = urgences_pb2.SuiviRequest(id_urgence=intervention_id)
        
        for update in stub.SuivreIntervention(suivi_req):
            print(f"  [Update] Ambulance à ({update.position_actuelle.latitude:.4f}, {update.position_actuelle.longitude:.4f}) | Arrivée dans : {update.temps_estime_arrivee} min | Status: {update.message_status}")

        print("\n--- 3. HISTORIQUE ---")
        hist_resp = stub.HistoriqueUrgences(urgences_pb2.HistoriqueRequest())
        print(f"Total urgences enregistrées : {len(hist_resp.urgences)}")
        for u in hist_resp.urgences:
             print(f"- {urgences_pb2.TypeUrgence.Name(u.type)} à ({u.position.latitude}, {u.position.longitude}) : {u.description}")

if __name__ == '__main__':
    run()
