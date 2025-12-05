package com.smartcity.mobility_service.services;

import com.smartcity.mobility_service.model.enums.TypeTransport;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import com.smartcity.mobility_service.repositories.TrajetRepository;
import com.smartcity.mobility_service.model.Trajet;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional // Important pour garantir l'intégrité des transactions BDD
public class MobilityService {

    private final TrajetRepository repository;

    public MobilityService(TrajetRepository repository) {
        this.repository = repository;
    }

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

    public Trajet createTrajet(Trajet trajet) {
        return repository.save(trajet);
    }

    public Trajet updateTrajet(Long id, Trajet details) {
        Trajet trajet = getTrajetById(id); // Réutilise la méthode qui lance l'exception si pas trouvé
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
}