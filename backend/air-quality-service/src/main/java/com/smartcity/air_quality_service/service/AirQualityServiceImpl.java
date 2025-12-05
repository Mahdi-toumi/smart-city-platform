package com.smartcity.air_quality_service.service;


import com.smartcity.air_quality_service.exception.VilleInconnueException;
import com.smartcity.air_quality_service.model.DonneesAir;
import com.smartcity.air_quality_service.model.NiveauAlerte;
import jakarta.jws.WebService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Random;

@WebService(endpointInterface = "com.smartcity.air_quality_service.service.AirQualityService", targetNamespace = "http://smartcity.com/air-quality")
@Service
public class AirQualityServiceImpl implements AirQualityService {

    private final Random random = new Random();

    // Liste des villes supportées par nos "capteurs"
    private final List<String> VILLES_SUPPORTEES = List.of("Tunis", "Sfax", "Sousse", "Paris", "Lyon");

    @Override
    public DonneesAir getQualiteAir(String ville) throws VilleInconnueException {

        // Validation Métier : La ville existe-t-elle ?
        // On ignore la casse (tunis == Tunis)
        if (VILLES_SUPPORTEES.stream().noneMatch(v -> v.equalsIgnoreCase(ville))) {
            throw new VilleInconnueException("Aucun capteur disponible pour la ville : " + ville);
        }

        // Simulation de données réalistes
        double iqa = 10 + (350 * random.nextDouble()); // IQA
        NiveauAlerte alerte = NiveauAlerte.fromIQA(iqa);

        // Corrélation simple : si IQA haut, PM2.5 haut
        double pm25 = (iqa / 4) + (random.nextDouble() * 10);
        double co = (iqa / 50) + random.nextDouble();

        double temp = 10 + (30 * random.nextDouble());
        double hum = 20 + (60 * random.nextDouble());

        return new DonneesAir(
                ville.toUpperCase(),
                new Date(),
                alerte, // L'enum sera sérialisé en XML (ex: <niveauAlerte>MODERE</niveauAlerte>)
                Math.round(iqa * 10.0) / 10.0,
                Math.round(co * 100.0) / 100.0,
                Math.round(pm25 * 10.0) / 10.0,
                Math.round(temp * 10.0) / 10.0,
                Math.round(hum * 10.0) / 10.0
        );
    }
}