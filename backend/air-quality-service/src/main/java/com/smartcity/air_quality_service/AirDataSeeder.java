package com.smartcity.air_quality_service;


import com.smartcity.air_quality_service.model.ReleveAir;
import com.smartcity.air_quality_service.model.NiveauPollution;
import com.smartcity.air_quality_service.repository.ReleveRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class AirDataSeeder implements CommandLineRunner {

    private final ReleveRepository repository;

    public AirDataSeeder(ReleveRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        // On ne remplit que si la base est vide
        if (repository.count() == 0) {

            // Relevé 1 : Tunis (Air Moyen)
            ReleveAir r1 = new ReleveAir();
            r1.setZone("Tunis - Kasbah");
            r1.setIndexAQI(85.5);
            r1.setTauxCO2(410.0);
            r1.setTauxNO2(25.0);
            r1.setTauxO3(10.0);
            r1.setDateReleve(new Date());
            r1.calculerNiveau(); // Calcul automatique de l'Enum (MOYEN)
            repository.save(r1);

            // Relevé 2 : Sfax (Air Mauvais - Zone industrielle)
            ReleveAir r2 = new ReleveAir();
            r2.setZone("Sfax - Zone Industrielle");
            r2.setIndexAQI(180.0); // Élevé
            r2.setTauxCO2(550.0);
            r2.setTauxNO2(60.0);
            r2.setTauxO3(30.0);
            r2.setDateReleve(new Date());
            r2.calculerNiveau(); // MAUVAIS
            repository.save(r2);

            // Relevé 3 : Djerba (Air Bon)
            ReleveAir r3 = new ReleveAir();
            r3.setZone("Djerba - Zone Touristique");
            r3.setIndexAQI(30.0); // Très bas
            r3.setTauxCO2(380.0);
            r3.setTauxNO2(5.0);
            r3.setTauxO3(2.0);
            r3.setDateReleve(new Date());
            r3.calculerNiveau(); // BON
            repository.save(r3);

            System.out.println("✅ Base AirQuality (PostgreSQL) initialisée avec 3 relevés.");
        }
    }
}