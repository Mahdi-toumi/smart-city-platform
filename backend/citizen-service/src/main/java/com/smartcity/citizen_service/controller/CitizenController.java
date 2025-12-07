package com.smartcity.citizen_service.controller;

import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.service.CitizenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    private final CitizenService service;

    public CitizenController(CitizenService service) {
        this.service = service;
    }

    // 1. Config : Liste des Catégories (Pour le Front)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    // 2. Créer (POST /api/citizen/reclamations)
    @PostMapping("/reclamations")
    public ResponseEntity<Reclamation> create(@Valid @RequestBody Reclamation rec) {
        return ResponseEntity.ok(service.creerReclamation(rec));
    }

    // 3. Voir mes réclamations (GET /api/citizen/reclamations/me?citoyenId=...)
    @GetMapping("/reclamations/me")
    public ResponseEntity<List<Reclamation>> getMyHistory(@RequestParam String citoyenId) {
        return ResponseEntity.ok(service.getHistoriqueCitoyen(citoyenId));
    }

    // 4. Admin : Voir TOUT (GET /api/citizen/reclamations/all)
    @GetMapping("/reclamations/all")
    public ResponseEntity<List<Reclamation>> getAll() {
        return ResponseEntity.ok(service.getAllReclamations());
    }

    // 5. Admin : Filtrer (GET /api/citizen/reclamations/filter?status=OUVERTE)
    @GetMapping("/reclamations/filter")
    public ResponseEntity<List<Reclamation>> filterByStatus(@RequestParam StatutReclamation status) {
        return ResponseEntity.ok(service.getByStatut(status));
    }

    // 6. Stats Dashboard (GET /api/citizen/reclamations/stats)
    @GetMapping("/reclamations/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(service.getStatistiques());
    }

    // 7. Mise à jour statut (PATCH /api/citizen/reclamations/{id}/status)
    @PatchMapping("/reclamations/{id}/status")
    public ResponseEntity<Reclamation> updateStatus(@PathVariable Long id, @RequestParam StatutReclamation status) {
        return ResponseEntity.ok(service.mettreAJourStatut(id, status));
    }

    // 8. Supprimer (DELETE /api/citizen/reclamations/{id})
    @DeleteMapping("/reclamations/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.supprimerReclamation(id);
        return ResponseEntity.noContent().build();
    }
}