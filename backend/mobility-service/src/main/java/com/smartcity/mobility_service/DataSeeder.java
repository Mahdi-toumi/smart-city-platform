package com.smartcity.mobility_service;


import com.smartcity.mobility_service.entities.Trajet;
import com.smartcity.mobility_service.entities.enums.EtatTrafic;
import com.smartcity.mobility_service.entities.enums.TypeTransport;
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
            repository.save(new Trajet(null, "Gare Centrale", "Université", TypeTransport.BUS, 25, EtatTrafic.FLUIDE));
            repository.save(new Trajet(null, "Place d'Armes", "Hôpital Nord", TypeTransport.METRO, 12, EtatTrafic.DENSE));
            repository.save(new Trajet(null, "Aéroport", "Centre Ville", TypeTransport.TRAMWAY, 40, EtatTrafic.PERTURBE));
            System.out.println("✅ Base de données Mobilité initialisée avec succès !");
        }
    }
}