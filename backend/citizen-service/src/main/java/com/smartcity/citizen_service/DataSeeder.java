package com.smartcity.citizen_service;

import com.smartcity.citizen_service.model.Reclamation;
import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.model.enums.TypeReclamation;
import com.smartcity.citizen_service.repository.ReclamationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ReclamationRepository repository;

    public DataSeeder(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {

            // 1. Une réclamation ouverte (Mahdi)
            repository.save(Reclamation.builder()
                    .citoyenId("mahdi")
                    .type(TypeReclamation.VOIRIE)
                    .description("Gros trou sur la route principale")
                    .adresse("Avenue Habib Bourguiba")
                    .statut(StatutReclamation.OUVERTE)
                    .dateCreation(new Date())
                    .build());

            // 2. Une réclamation traitée (Mahdi)
            repository.save(Reclamation.builder()
                    .citoyenId("mahdi")
                    .type(TypeReclamation.ECLAIRAGE)
                    .description("Lampadaire en panne")
                    .adresse("Rue de Paris")
                    .statut(StatutReclamation.TRAITEE)
                    .dateCreation(new Date())
                    .dateTraitement(new Date())
                    .build());

            // 3. Une réclamation en cours (Autre citoyen)
            repository.save(Reclamation.builder()
                    .citoyenId("sami")
                    .type(TypeReclamation.DECHETS)
                    .description("Poubelles non ramassées depuis 3 jours")
                    .adresse("Cité Ennasr")
                    .statut(StatutReclamation.EN_COURS)
                    .dateCreation(new Date())
                    .build());

            System.out.println(" Base Citoyen (MySQL) initialisée avec 3 réclamations.");
        }
    }
}