package com.smartcity.air_quality_service.service;

import com.smartcity.air_quality_service.exception.VilleInconnueException;
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
    public ReleveAir getQualiteAir(String zone) throws VilleInconnueException {

        // Validation : Si la zone est vide -> Erreur SOAP (Fault)
        if (zone == null || zone.trim().isEmpty()) {
            throw new VilleInconnueException("La zone demandée ne peut pas être vide.");
        }

        // 1. Simulation capteurs
        ReleveAir releve = new ReleveAir();
        releve.setZone(zone);
        releve.setDateReleve(new Date());

        // Génération de valeurs aléatoires réalistes
        double aqi = 10 + (250 * random.nextDouble());
        releve.setIndexAQI(Math.round(aqi * 100.0) / 100.0);
        releve.setTauxCO2(Math.round((400 + random.nextDouble() * 50) * 100.0) / 100.0);
        releve.setTauxNO2(Math.round((10 + random.nextDouble() * 40) * 100.0) / 100.0);
        releve.setTauxO3(Math.round((5 + random.nextDouble() * 30) * 100.0) / 100.0);

        releve.calculerNiveau();

        // 2. Sauvegarde PostgreSQL
        repository.save(releve);
        System.out.println("[SOAP] Relevé généré pour : " + zone + " (AQI: " + releve.getIndexAQI() + ")");

        return releve;
    }
}