package com.smartcity.mobility_service.controllers;

import com.smartcity.mobility_service.entities.Trajet;
import com.smartcity.mobility_service.entities.enums.TypeTransport;
import com.smartcity.mobility_service.services.MobilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mobility/trajets")
public class MobilityController {

    private final MobilityService service;

    public MobilityController(MobilityService service) {
        this.service = service;
    }

    // GET global
    @GetMapping
    public List<Trajet> getAllTrajets() {
        return service.getAllTrajets();
    }

    // GET par ID avec gestion 404
    @GetMapping("/{id}")
    public ResponseEntity<Trajet> getTrajetById(@PathVariable Long id) {
        return service.getTrajetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET Filtre par Type (ex: /search?type=BUS)
    @GetMapping("/search")
    public List<Trajet> getTrajetsByType(@RequestParam TypeTransport type) {
        return service.getTrajetsByType(type);
    }

    // POST
    @PostMapping
    public ResponseEntity<Trajet> createTrajet(@RequestBody Trajet trajet) {
        return ResponseEntity.ok(service.createTrajet(trajet));
    }

    // PUT (Mise à jour)
    @PutMapping("/{id}")
    public ResponseEntity<Trajet> updateTrajet(@PathVariable Long id, @RequestBody Trajet trajet) {
        try {
            return ResponseEntity.ok(service.updateTrajet(id, trajet));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrajet(@PathVariable Long id) {
        service.deleteTrajet(id);
        return ResponseEntity.noContent().build();
    }
}