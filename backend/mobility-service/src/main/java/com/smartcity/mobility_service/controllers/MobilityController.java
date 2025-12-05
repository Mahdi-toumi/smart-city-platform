package com.smartcity.mobility_service.controllers;

import com.smartcity.mobility_service.model.Trajet;
import com.smartcity.mobility_service.model.enums.TypeTransport;
import com.smartcity.mobility_service.services.MobilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    @GetMapping
    public ResponseEntity<List<Trajet>> getAll() {
        return ResponseEntity.ok(service.getAllTrajets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trajet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTrajetById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Trajet>> getByType(@RequestParam TypeTransport type) {
        return ResponseEntity.ok(service.getTrajetsByType(type));
    }

    @PostMapping
    public ResponseEntity<Trajet> create(@Valid @RequestBody Trajet trajet) {
        return new ResponseEntity<>(service.createTrajet(trajet), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trajet> update(@PathVariable Long id, @Valid @RequestBody Trajet trajet) {
        return ResponseEntity.ok(service.updateTrajet(id, trajet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteTrajet(id);
        return ResponseEntity.noContent().build();
    }
}