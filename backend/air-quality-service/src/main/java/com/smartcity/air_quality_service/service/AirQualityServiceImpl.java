package com.smartcity.air_quality_service.service;

import com.smartcity.air_quality_service.model.ReleveAir;
import com.smartcity.air_quality_service.repository.ReleveRepository;
import jakarta.jws.WebService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Random;

@Service
@WebService(
        endpointInterface = "com.smartcity.air_quality_service.service.AirQualityService",
        targetNamespace = "http://smartcity.com/air-quality"
)
public class AirQualityServiceImpl implements AirQualityService {

    private final ReleveRepository repository;
    private final Random random = new Random();

    public AirQualityServiceImpl(ReleveRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReleveAir getQualiteAir(String zone) {
        // 1. Simulation de données capteurs (Car nous n'avons pas de vrais capteurs IoT)
        ReleveAir releve = new ReleveAir();
        releve.setZone(zone);
        releve.setDateReleve(new Date());

        // Simulation aléatoire réaliste
        double aqi = 10 + (250 * random.nextDouble()); // Entre 10 et 260
        releve.setIndexAQI(Math.round(aqi * 100.0) / 100.0);

        releve.setTauxCO2(400 + random.nextDouble() * 50);
        releve.setTauxNO2(10 + random.nextDouble() * 40);
        releve.setTauxO3(5 + random.nextDouble() * 30);

        // Calculer l'enum (BON, MAUVAIS...)
        releve.calculerNiveau();

        // 2. Sauvegarde en PostgreSQL (Historique)
        repository.save(releve);
        System.out.println("[SOAP] Nouveau relevé sauvegardé pour : " + zone);

        return releve;
    }
}