package com.smartcity.orchestrator_service.controller;

import com.smartcity.orchestrator.grpc.TypeUrgence;
import com.smartcity.orchestrator_service.client.AirQualityClient;
import com.smartcity.orchestrator_service.client.EmergencyClient;
import com.smartcity.orchestrator_service.dto.SosRequest;
import com.smartcity.orchestrator_service.dto.UrgenceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter; // Import Important

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orchestrator")
@RequiredArgsConstructor
public class OrchestratorController {

    private final EmergencyClient emergencyClient;
    private final AirQualityClient airClient;

    // Thread pool pour gérer le streaming sans bloquer le serveur
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @PostMapping("/sos")
    public ResponseEntity<Map<String, String>> triggerEmergency(@RequestBody SosRequest request) {
        String id = emergencyClient.sendEmergency(
                request.getType(),
                request.getDescription(),
                request.getLatitude(),
                request.getLongitude(),
                request.getCitoyenId()
        );
        return ResponseEntity.ok(Map.of("message", "Secours notifiés", "urgenceId", id));
    }

    // --- MODIFICATION ICI : Utilisation de SseEmitter ---
    @GetMapping("/live/{id}")
    public SseEmitter trackEmergency(@PathVariable String id) {
        // Timeout infini (ou long) pour le streaming
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        // On lance le traitement dans un thread séparé
        executor.execute(() -> {
            try {
                Iterator<String> iterator = emergencyClient.streamIntervention(id);

                while (iterator.hasNext()) {
                    String data = iterator.next();
                    // Envoi immédiat au Frontend
                    emitter.send(SseEmitter.event().data(data));
                }

                // Fin du stream
                emitter.complete();
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        });

        return emitter;
    }

    @GetMapping("/history")
    public ResponseEntity<List<UrgenceDto>> getHistory(@RequestParam String citoyenId) {
        return ResponseEntity.ok(emergencyClient.getHistorique(citoyenId));
    }

    @GetMapping("/air")
    public ResponseEntity<?> checkAir(@RequestParam String zone) {
        var data = airClient.getAirQuality(zone);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/types-urgence")
    public ResponseEntity<List<String>> getTypesUrgence() {
        List<String> types = Arrays.stream(TypeUrgence.values())
                .filter(t -> t != TypeUrgence.INCONNU && t != TypeUrgence.UNRECOGNIZED)
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(types);
    }
}