package com.smartcity.orchestrator_service.client;

import com.smartcity.orchestrator.grpc.*;
import com.smartcity.orchestrator_service.dto.UrgenceDto;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyClient {

    private final UrgenceServiceGrpc.UrgenceServiceBlockingStub blockingStub;

    public EmergencyClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress("emergency-service", 50053)
                .usePlaintext()
                .build();
        this.blockingStub = UrgenceServiceGrpc.newBlockingStub(channel);
    }

    public String sendEmergency(String typeStr, String description, double lat, double lon, String citoyenId) {
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
        return response.getId();
    }

    // --- MODIFICATION ICI : On renvoie l'itérateur brut ---
    public Iterator<String> streamIntervention(String urgenceId) {
        SuiviRequest request = SuiviRequest.newBuilder().setIdUrgence(urgenceId).build();

        // Appel gRPC (bloquant)
        Iterator<SuiviUpdate> grpcIterator = blockingStub.suivreIntervention(request);

        // On convertit à la volée en String JSON
        return new Iterator<String>() {
            @Override
            public boolean hasNext() {
                return grpcIterator.hasNext();
            }

            @Override
            public String next() {
                SuiviUpdate update = grpcIterator.next();
                return String.format(
                        "{\"lat\": %.4f, \"lon\": %.4f, \"status\": \"%s\", \"eta\": %d}",
                        update.getPositionActuelle().getLatitude(),
                        update.getPositionActuelle().getLongitude(),
                        update.getMessageStatus(),
                        update.getTempsEstimeArrivee()
                );
            }
        };
    }

    public List<UrgenceDto> getHistorique(String citoyenId) {
        HistoriqueRequest request = HistoriqueRequest.newBuilder()
                .setCitoyenId(citoyenId)
                .build();

        HistoriqueResponse response = blockingStub.historiqueUrgences(request);

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