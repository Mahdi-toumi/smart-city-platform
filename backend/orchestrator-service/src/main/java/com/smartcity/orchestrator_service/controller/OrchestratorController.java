package com.smartcity.orchestrator_service.controller;

import com.smartcity.orchestrator.grpc.TypeUrgence; // Import de l'Enum généré
import com.smartcity.orchestrator_service.client.AirQualityClient;
import com.smartcity.orchestrator_service.client.EmergencyClient;
import com.smartcity.orchestrator_service.dto.SosRequest;
import com.smartcity.orchestrator_service.dto.UrgenceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orchestrator")
@RequiredArgsConstructor
public class OrchestratorController {

    private final EmergencyClient emergencyClient;
    private final AirQualityClient airClient;

    // --- 1. SIGNALER (POST) ---
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

    // --- 2. SUIVRE LIVE (GET SSE) ---
    @GetMapping(value = "/live/{id}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> trackEmergency(@PathVariable String id) {
        return emergencyClient.streamIntervention(id);
    }

    // --- 3. HISTORIQUE (GET) ---
    @GetMapping("/history")
    public ResponseEntity<List<UrgenceDto>> getHistory(@RequestParam String citoyenId) {
        return ResponseEntity.ok(emergencyClient.getHistorique(citoyenId));
    }

    // --- 4. AIR QUALITY (GET) ---
    @GetMapping("/air")
    public ResponseEntity<?> checkAir(@RequestParam String zone) {
        var data = airClient.getAirQuality(zone);
        return ResponseEntity.ok(data);
    }

    // --- 5. [NOUVEAU] LISTE DES TYPES D'URGENCE (GET) ---
    // Sert à remplir le <select> dans le formulaire React
    @GetMapping("/types-urgence")
    public ResponseEntity<List<String>> getTypesUrgence() {
        // On filtre "INCONNU" et "UNRECOGNIZED" pour ne pas polluer l'interface
        List<String> types = Arrays.stream(TypeUrgence.values())
                .filter(t -> t != TypeUrgence.INCONNU && t != TypeUrgence.UNRECOGNIZED)
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(types);
    }
}