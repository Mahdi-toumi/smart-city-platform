package com.smartcity.mobility_service.controllers;

import com.smartcity.mobility_service.model.Trajet;
import com.smartcity.mobility_service.model.enums.StatusTrafic;
import com.smartcity.mobility_service.model.enums.TypeTransport;
import com.smartcity.mobility_service.services.MobilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mobility") // Note: j'ai enlevé "/trajets" du chemin de base pour être plus flexible
public class MobilityController {

    private final MobilityService service;

    public MobilityController(MobilityService service) {
        this.service = service;
    }

    // 1. Liste complète (GET /api/mobility/trajets)
    @GetMapping("/trajets")
    public ResponseEntity<List<Trajet>> getAll() {
        return ResponseEntity.ok(service.getAllTrajets());
    }

    // 2. Un seul trajet (GET /api/mobility/trajets/{id})
    @GetMapping("/trajets/{id}")
    public ResponseEntity<Trajet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTrajetById(id));
    }

    // 3. Recherche par type (GET /api/mobility/trajets/search?type=BUS)
    @GetMapping("/trajets/search")
    public ResponseEntity<List<Trajet>> getByType(@RequestParam TypeTransport type) {
        return ResponseEntity.ok(service.getTrajetsByType(type));
    }



    // 4. Création (POST /api/mobility/trajets) -> ADMIN
    @PostMapping("/trajets")
    public ResponseEntity<Trajet> create(@Valid @RequestBody Trajet trajet) {
        return new ResponseEntity<>(service.createTrajet(trajet), HttpStatus.CREATED);
    }

    // 5. Mise à jour (PUT /api/mobility/trajets/{id}) -> ADMIN
    @PutMapping("/trajets/{id}")
    public ResponseEntity<Trajet> update(@PathVariable Long id, @Valid @RequestBody Trajet trajet) {
        return ResponseEntity.ok(service.updateTrajet(id, trajet));
    }

    // 6. Suppression (DELETE /api/mobility/trajets/{id}) -> ADMIN
    @DeleteMapping("/trajets/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteTrajet(id);
        return ResponseEntity.noContent().build();
    }

    // --- NOUVEAUX ENDPOINTS POUR LE FRONT ---

    // 7. Statut Global (GET /api/mobility/status)
    // Utile pour le Widget "Info Trafic" sur la page d'accueil
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(service.getGlobalTrafficStatus());
    }

    // 8. Liste des Types (GET /api/mobility/types)
    // Utile pour remplir la liste déroulante dans le formulaire Admin
    @GetMapping("/types")
    public ResponseEntity<TypeTransport[]> getTypes() {
        return ResponseEntity.ok(TypeTransport.values());
    }

    // 9. Filtrer par Statut (GET /api/mobility/trajets/filter?status=PERTURBE)
    @GetMapping("/trajets/filter")
    public ResponseEntity<List<Trajet>> getByStatus(@RequestParam StatusTrafic status) {
        return ResponseEntity.ok(service.getTrajetsByStatus(status));
    }
}