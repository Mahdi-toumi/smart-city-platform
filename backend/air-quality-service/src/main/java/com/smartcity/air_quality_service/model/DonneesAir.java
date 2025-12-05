package com.smartcity.air_quality_service.model;

import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Cette classe représente la réponse XML que les clients recevront.
 * @XmlRootElement : Indique que cet objet sera la racine du XML.
 */
@Data

@XmlRootElement(name = "DonneesAir")
public class DonneesAir {

    private String stationVille;
    private Date dateMesure;

    // Données principales
    private double indiceIQA;
    private NiveauAlerte niveauAlerte; // Utilisation de l'Enum

    // Détail des polluants (Microgrammes par m3)
    private double monoxydeCarbone; // CO
    private double particulesFines; // PM2.5

    // Météo contextuelle
    private double temperature;
    private double humidite;

    public DonneesAir() {
    }

    public DonneesAir(String stationVille, Date dateMesure, NiveauAlerte niveauAlerte, double indiceIQA, double monoxydeCarbone, double particulesFines, double temperature, double humidite) {
        this.stationVille = stationVille;
        this.dateMesure = dateMesure;
        this.niveauAlerte = niveauAlerte;
        this.indiceIQA = indiceIQA;
        this.monoxydeCarbone = monoxydeCarbone;
        this.particulesFines = particulesFines;
        this.temperature = temperature;
        this.humidite = humidite;
    }

    public String getStationVille() {
        return stationVille;
    }

    public double getIndiceIQA() {
        return indiceIQA;
    }

    public double getTemperature() {
        return temperature;
    }

    public NiveauAlerte getNiveauAlerte() {
        return niveauAlerte;
    }

    public double getHumidite() {
        return humidite;
    }

    public Date getDateMesure() {
        return dateMesure;
    }

    public void setStationVille(String stationVille) {
        this.stationVille = stationVille;
    }

    public void setNiveauAlerte(NiveauAlerte niveauAlerte) {
        this.niveauAlerte = niveauAlerte;
    }

    public void setIndiceIQA(double indiceIQA) {
        this.indiceIQA = indiceIQA;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public void setHumidite(double humidite) {
        this.humidite = humidite;
    }

    public void setDateMesure(Date dateMesure) {
        this.dateMesure = dateMesure;
    }
}