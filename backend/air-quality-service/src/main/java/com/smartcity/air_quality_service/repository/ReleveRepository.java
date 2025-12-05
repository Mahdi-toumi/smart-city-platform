package com.smartcity.air_quality_service.repository;

import com.smartcity.air_quality_service.model.ReleveAir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReleveRepository extends JpaRepository<ReleveAir, Long> {
    // Trouver le dernier relevé pour une zone donnée
    Optional<ReleveAir> findTopByZoneOrderByDateReleveDesc(String zone);
}