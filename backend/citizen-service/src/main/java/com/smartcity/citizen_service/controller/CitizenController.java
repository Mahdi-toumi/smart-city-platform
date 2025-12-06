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
@RequestMapping("/api/citizen/reclamations") // URL de base simplifiée
public class CitizenController {

    private final CitizenService service;

    public CitizenController(CitizenService service) {
        this.service = service;
    }

    // 1. Créer (POST)
    @PostMapping
    public ResponseEntity<Reclamation> create(@Valid @RequestBody Reclamation rec) {
        return ResponseEntity.ok(service.creerReclamation(rec));
    }

    // 2. Voir mon historique (GET ?citoyenId=...)
    @GetMapping("/me")
    public List<Reclamation> getMyHistory(@RequestParam String citoyenId) {
        return service.getHistoriqueCitoyen(citoyenId);
    }

    // 3. Voir TOUT (Admin) (GET /all)
    @GetMapping("/all")
    public List<Reclamation> getAll() {
        return service.getAllReclamations();
    }

    // 4. Filtrer par statut (GET /filter?status=OUVERTE)
    @GetMapping("/filter")
    public List<Reclamation> filterByStatus(@RequestParam StatutReclamation status) {
        return service.getByStatut(status);
    }

    // 5. Statistiques (GET /stats)
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(service.getStatistiques());
    }

    // 6. Mettre à jour statut (PATCH /{id}/status?status=TRAITEE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Reclamation> updateStatus(@PathVariable Long id, @RequestParam StatutReclamation status) {
        return ResponseEntity.ok(service.mettreAJourStatut(id, status));
    }

    // 7. Supprimer (DELETE /{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.supprimerReclamation(id);
        return ResponseEntity.noContent().build();
    }
}