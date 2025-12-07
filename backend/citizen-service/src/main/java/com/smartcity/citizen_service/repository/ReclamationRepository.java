package com.smartcity.citizen_service.repository;

import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    // Pour le citoyen : Voir SES réclamations
    List<Reclamation> findByCitoyenId(String citoyenId);

    // Pour l'admin : Filtrer par statut
    List<Reclamation> findByStatut(StatutReclamation statut);

    // Pour les stats : Compter par statut
    long countByStatut(StatutReclamation statut);
}