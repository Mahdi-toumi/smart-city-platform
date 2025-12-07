package com.smartcity.orchestrator_service.client;

import com.smartcity.orchestrator.grpc.*; // Classes générées par Maven
import com.smartcity.orchestrator_service.dto.UrgenceDto;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyClient {

    private final UrgenceServiceGrpc.UrgenceServiceBlockingStub blockingStub;

    public EmergencyClient() {
        // Connexion au conteneur Python "emergency-service" sur le port 50053
        ManagedChannel channel = ManagedChannelBuilder.forAddress("emergency-service", 50053)
                .usePlaintext()
                .build();
        this.blockingStub = UrgenceServiceGrpc.newBlockingStub(channel);
    }

    // ---------------------------------------------------------
    // 1. SIGNALER UNE URGENCE (Unary)
    // ---------------------------------------------------------
    public String sendEmergency(String typeStr, String description, double lat, double lon, String citoyenId) {
        // Conversion String -> Enum
        TypeUrgence typeEnum;
        try {
            typeEnum = TypeUrgence.valueOf(typeStr.toUpperCase());
        } catch (Exception e) {
            typeEnum = TypeUrgence.INCONNU;
        }

        UrgenceRequest request = UrgenceRequest.newBuilder()
                .setType(typeEnum)
                .setPosition(Coordonnees.newBuilder().setLatitude(lat).setLongitude(lon).build())
                .setDescription(description)
                .setCitoyenId(citoyenId)
                .build();

        UrgenceResponse response = blockingStub.signalerUrgence(request);
        return response.getId(); // On retourne l'ID généré par Mongo
    }

    // ---------------------------------------------------------
    // 2. SUIVRE INTERVENTION (Server Streaming)
    // ---------------------------------------------------------
    public Flux<String> streamIntervention(String urgenceId) {
        SuiviRequest request = SuiviRequest.newBuilder().setIdUrgence(urgenceId).build();

        // Appel bloquant qui récupère un Itérateur
        Iterator<SuiviUpdate> iterator = blockingStub.suivreIntervention(request);

        // Transformation en Flux Réactif pour le Web (SSE)
        return Flux.fromIterable(() -> iterator)
                .map(update -> String.format(
                        "{\"lat\": %.4f, \"lon\": %.4f, \"status\": \"%s\", \"eta\": %d}",
                        update.getPositionActuelle().getLatitude(),
                        update.getPositionActuelle().getLongitude(),
                        update.getMessageStatus(),
                        update.getTempsEstimeArrivee()
                ));
    }

    // ---------------------------------------------------------
    // 3. HISTORIQUE (Unary qui retourne une liste)
    // ---------------------------------------------------------
    public List<UrgenceDto> getHistorique(String citoyenId) {
        HistoriqueRequest request = HistoriqueRequest.newBuilder()
                .setCitoyenId(citoyenId)
                .build();

        HistoriqueResponse response = blockingStub.historiqueUrgences(request);

        // Conversion de la liste gRPC (Protobuf) vers une liste Java DTO classique
        return response.getUrgencesList().stream()
                .map(protoUrgence -> UrgenceDto.builder()
                        .type(protoUrgence.getType().name())
                        .description(protoUrgence.getDescription())
                        .latitude(protoUrgence.getPosition().getLatitude())
                        .longitude(protoUrgence.getPosition().getLongitude())
                        .build())
                .collect(Collectors.toList());
    }
}