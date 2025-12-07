package com.smartcity.citizen_service.service;

import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.model.enums.TypeReclamation;
import com.smartcity.citizen_service.repository.ReclamationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class CitizenService {

    private final ReclamationRepository repository;

    public CitizenService(ReclamationRepository repository) {
        this.repository = repository;
    }

    // --- Actions Citoyen ---

    public Reclamation creerReclamation(Reclamation rec) {
        return repository.save(rec);
    }

    public List<Reclamation> getHistoriqueCitoyen(String citoyenId) {
        return repository.findByCitoyenId(citoyenId);
    }

    // --- Actions Admin ---

    public List<Reclamation> getAllReclamations() {
        return repository.findAll();
    }

    public Reclamation getReclamation(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reclamation introuvable ID: " + id));
    }

    public List<Reclamation> getByStatut(StatutReclamation statut) {
        return repository.findByStatut(statut);
    }

    public Reclamation mettreAJourStatut(Long id, StatutReclamation nouveauStatut) {
        Reclamation rec = getReclamation(id);
        rec.setStatut(nouveauStatut);

        // Si traitée ou rejetée, on met la date de fin
        if (nouveauStatut == StatutReclamation.TRAITEE || nouveauStatut == StatutReclamation.REJETEE) {
            rec.setDateTraitement(new Date());
        }
        return repository.save(rec);
    }

    public void supprimerReclamation(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Impossible de supprimer : ID inconnu");
        }
        repository.deleteById(id);
    }

    // --- Données pour le Frontend ---

    public Map<String, Long> getStatistiques() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("OUVERTE", repository.countByStatut(StatutReclamation.OUVERTE));
        stats.put("EN_COURS", repository.countByStatut(StatutReclamation.EN_COURS));
        stats.put("TRAITEE", repository.countByStatut(StatutReclamation.TRAITEE));
        stats.put("TOTAL", repository.count());
        return stats;
    }

    // Renvoie la liste des types (Pour le <select> du Frontend)
    public List<String> getCategories() {
        return Stream.of(TypeReclamation.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }
}