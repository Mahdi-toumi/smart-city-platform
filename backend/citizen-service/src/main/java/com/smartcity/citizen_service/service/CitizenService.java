package com.smartcity.citizen_service.service;


import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.repository.ReclamationRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CitizenService {

    private final ReclamationRepository repository;

    public CitizenService(ReclamationRepository repository) {
        this.repository = repository;
    }

    public Reclamation creerReclamation(Reclamation rec) {
        return repository.save(rec);
    }

    public List<Reclamation> getHistoriqueCitoyen(String citoyenId) {
        return repository.findByCitoyenId(citoyenId);
    }

    public Reclamation getReclamation(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Reclamation introuvable"));
    }

    public Reclamation mettreAJourStatut(Long id, StatutReclamation nouveauStatut) {
        Reclamation rec = getReclamation(id);
        rec.setStatut(nouveauStatut);
        if (nouveauStatut == StatutReclamation.TRAITEE) {
            rec.setDateTraitement(new Date());
        }
        return repository.save(rec);
    }

    // --- NOUVEAUX ENDPOINTS ---

    // 1. Récupérer TOUTES les réclamations (Vue Admin globale)
    public List<Reclamation> getAllReclamations() {
        return repository.findAll();
    }

    // 2. Filtrer par statut
    public List<Reclamation> getByStatut(StatutReclamation statut) {
        return repository.findByStatut(statut);
    }

    // 3. Statistiques (Pour le Dashboard de la Mairie)
    public Map<String, Long> getStatistiques() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total_ouvertes", repository.countByStatut(StatutReclamation.OUVERTE));
        stats.put("total_traitees", repository.countByStatut(StatutReclamation.TRAITEE));
        stats.put("total_global", repository.count());
        return stats;
    }

    // 4. Suppression
    public void supprimerReclamation(Long id) {
        repository.deleteById(id);
    }
}