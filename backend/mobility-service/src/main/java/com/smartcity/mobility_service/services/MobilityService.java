package com.smartcity.mobility_service.services;

import com.smartcity.mobility_service.model.Trajet;
import com.smartcity.mobility_service.model.enums.StatusTrafic;
import com.smartcity.mobility_service.model.enums.TypeTransport;
import com.smartcity.mobility_service.repositories.TrajetRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class MobilityService {

    private final TrajetRepository repository;

    public MobilityService(TrajetRepository repository) {
        this.repository = repository;
    }

    // --- CRUD Classique ---

    public List<Trajet> getAllTrajets() {
        return repository.findAll();
    }

    public Trajet getTrajetById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trajet introuvable avec l'ID : " + id));
    }

    public List<Trajet> getTrajetsByType(TypeTransport type) {
        return repository.findByTypeTransport(type);
    }

    public List<Trajet> getTrajetsByStatus(StatusTrafic status) {
        return repository.findByStatusTrafic(status);
    }

    public Trajet createTrajet(Trajet trajet) {
        return repository.save(trajet);
    }

    public Trajet updateTrajet(Long id, Trajet details) {
        Trajet trajet = getTrajetById(id);
        trajet.setDepart(details.getDepart());
        trajet.setDestination(details.getDestination());
        trajet.setTypeTransport(details.getTypeTransport());
        trajet.setDureeEstimee(details.getDureeEstimee());
        trajet.setStatusTrafic(details.getStatusTrafic());
        return repository.save(trajet);
    }

    public void deleteTrajet(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Impossible de supprimer : Trajet introuvable ID " + id);
        }
        repository.deleteById(id);
    }

    // --- NOUVEAU : Logique pour le Widget Frontend ---

    public Map<String, Object> getGlobalTrafficStatus() {
        List<Trajet> all = repository.findAll();
        if (all.isEmpty()) {
            return Map.of("ville", "Tunis", "etat", "INCONNU", "message", "Aucune donnée disponible");
        }

        // Logique simple : Si plus de 30% des trajets sont perturbés ou à l'arrêt -> TRAFIC PERTURBÉ
        long incidents = all.stream()
                .filter(t -> t.getStatusTrafic() == StatusTrafic.PERTURBE || t.getStatusTrafic() == StatusTrafic.ARRET)
                .count();

        boolean isPerturbe = incidents > (all.size() * 0.3); // Seuil de 30%

        Map<String, Object> status = new HashMap<>();
        status.put("ville", "Tunis");
        status.put("etat", isPerturbe ? "PERTURBÉ" : "FLUIDE");
        status.put("message", isPerturbe
                ? "Plusieurs ralentissements signalés."
                : "Conditions de circulation optimales.");
        status.put("incidentsSignales", incidents);

        return status;
    }
}