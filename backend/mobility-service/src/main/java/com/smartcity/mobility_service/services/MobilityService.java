package com.smartcity.mobility_service.services;

import com.smartcity.mobility_service.entities.enums.TypeTransport;
import org.springframework.stereotype.Service;
import com.smartcity.mobility_service.repositories.TrajetRepository;
import com.smartcity.mobility_service.entities.Trajet;
import java.util.List;
import java.util.Optional;

@Service
public class MobilityService {

    private final TrajetRepository repository;

    public MobilityService(TrajetRepository repository) {
        this.repository = repository;
    }

    public List<Trajet> getAllTrajets() {
        return repository.findAll();
    }

    public Optional<Trajet> getTrajetById(Long id) {
        return repository.findById(id);
    }

    // Recherche par type
    public List<Trajet> getTrajetsByType(TypeTransport type) {
        return repository.findByTypeTransport(type);
    }

    public Trajet createTrajet(Trajet trajet) {
        return repository.save(trajet);
    }

    // Mise à jour d'un trajet existant
    public Trajet updateTrajet(Long id, Trajet trajetDetails) {
        return repository.findById(id).map(trajet -> {
            trajet.setDepart(trajetDetails.getDepart());
            trajet.setDestination(trajetDetails.getDestination());
            trajet.setTypeTransport(trajetDetails.getTypeTransport());
            trajet.setDureeEstimee(trajetDetails.getDureeEstimee());
            trajet.setEtatTrafic(trajetDetails.getEtatTrafic());
            return repository.save(trajet);
        }).orElseThrow(() -> new RuntimeException("Trajet non trouvé avec l'id " + id));
    }

    // Suppression
    public void deleteTrajet(Long id) {
        repository.deleteById(id);
    }
}