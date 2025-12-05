package com.smartcity.mobility_service.repositories;

import com.smartcity.mobility_service.entities.Trajet;
import com.smartcity.mobility_service.entities.enums.EtatTrafic;
import com.smartcity.mobility_service.entities.enums.TypeTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrajetRepository extends JpaRepository<Trajet, Long> {
    // Trouver tous les trajets d'un type spécifique (ex: Tous les BUS)
    List<Trajet> findByTypeTransport(TypeTransport type);

    // Trouver tous les trajets ayant un certain état (ex: Tous les PERTURBE)
    List<Trajet> findByEtatTrafic(EtatTrafic etat);
}