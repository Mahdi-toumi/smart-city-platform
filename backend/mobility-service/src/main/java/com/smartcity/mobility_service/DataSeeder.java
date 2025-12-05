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
        // On ne remplit que si la base est vide
        if (repository.count() == 0) {
            repository.save(new Trajet(null, "Gare Centrale", "Université",  25,TypeTransport.BUS, StatusTrafic.FLUIDE));
            repository.save(new Trajet(null, "Place d'Armes", "Hôpital Nord",  12,TypeTransport.METRO, StatusTrafic.DENSE));
            repository.save(new Trajet(null, "Aéroport", "Centre Ville", 40,TypeTransport.TRAMWAY,  StatusTrafic.PERTURBE));
            System.out.println("✅ Base de données Mobilité initialisée avec succès !");
        }
    }
}