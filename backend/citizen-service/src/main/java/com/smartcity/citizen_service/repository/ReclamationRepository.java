package com.smartcity.citizen_service.repository;


import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    // Historique d'un citoyen
    List<Reclamation> findByCitoyenId(String citoyenId);

    // Filtre pour les Admins (ex: Voir tout ce qui est OUVERT)
    List<Reclamation> findByStatut(StatutReclamation statut);

    // Compteur pour les Statistiques
    long countByStatut(StatutReclamation statut);
}