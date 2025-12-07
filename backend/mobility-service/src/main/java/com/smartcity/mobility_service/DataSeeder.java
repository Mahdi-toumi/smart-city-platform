package com.smartcity.mobility_service;

import com.smartcity.mobility_service.model.Trajet;
import com.smartcity.mobility_service.model.enums.StatusTrafic;
import com.smartcity.mobility_service.model.enums.TypeTransport;
import com.smartcity.mobility_service.repositories.TrajetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TrajetRepository repository;

    public DataSeeder(TrajetRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            // Utilisation du constructeur AllArgs généré par Lombok
            repository.save(new Trajet(null, "Gare Centrale", "Université", TypeTransport.BUS,25,  StatusTrafic.FLUIDE));
            repository.save(new Trajet(null, "Place d'Armes", "Hôpital Nord",TypeTransport.METRO, 12,  StatusTrafic.DENSE));
            repository.save(new Trajet(null, "Aéroport", "Centre Ville",TypeTransport.TRAMWAY, 40,  StatusTrafic.PERTURBE));

            // Ajout d'un trajet "ARRET" pour tester le statut global
            repository.save(new Trajet(null, "Banlieue Sud", "Stade",TypeTransport.TRAIN, 60,  StatusTrafic.ARRET));

            System.out.println("Base de données Mobilité initialisée avec succès");
        }
    }
}