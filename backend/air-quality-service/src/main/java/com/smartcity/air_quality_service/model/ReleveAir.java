package com.smartcity.air_quality_service.model;

import com.smartcity.air_quality_service.model.NiveauPollution;
import jakarta.persistence.*;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "releves_air")
@Data
@XmlRootElement(name = "ReleveAir") // Racine du XML
@XmlAccessorType(XmlAccessType.FIELD)
public class ReleveAir {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String zone; // Ex: "Centre-Ville"

    private double indexAQI; // Air Quality Index (0-500)

    private double tauxCO2; // Dioxyde de carbone
    private double tauxNO2; // Dioxyde d'azote
    private double tauxO3;  // Ozone

    @Enumerated(EnumType.STRING)
    private NiveauPollution niveau;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateReleve;

    // Logique métier : Calcul automatique du niveau selon l'AQI
    public void calculerNiveau() {
        if (indexAQI < 50) this.niveau = NiveauPollution.BON;
        else if (indexAQI < 100) this.niveau = NiveauPollution.MOYEN;
        else if (indexAQI < 150) this.niveau = NiveauPollution.DEGRADE;
        else if (indexAQI < 200) this.niveau = NiveauPollution.MAUVAIS;
        else this.niveau = NiveauPollution.DANGEREUX;
    }

    public ReleveAir() {}

    public ReleveAir(Long id, String zone, double indexAQI, double tauxCO2, double tauxNO2, double tauxO3, NiveauPollution niveau, Date dateReleve) {
        this.id = id;
        this.zone = zone;
        this.indexAQI = indexAQI;
        this.tauxCO2 = tauxCO2;
        this.tauxNO2 = tauxNO2;
        this.tauxO3 = tauxO3;
        this.niveau = niveau;
        this.dateReleve = dateReleve;
    }

    public Long getId() {
        return id;
    }

    public String getZone() {
        return zone;
    }

    public double getIndexAQI() {
        return indexAQI;
    }

    public double getTauxCO2() {
        return tauxCO2;
    }

    public double getTauxO3() {
        return tauxO3;
    }

    public double getTauxNO2() {
        return tauxNO2;
    }

    public NiveauPollution getNiveau() {
        return niveau;
    }

    public Date getDateReleve() {
        return dateReleve;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public void setTauxCO2(double tauxCO2) {
        this.tauxCO2 = tauxCO2;
    }

    public void setIndexAQI(double indexAQI) {
        this.indexAQI = indexAQI;
    }

    public void setTauxNO2(double tauxNO2) {
        this.tauxNO2 = tauxNO2;
    }

    public void setTauxO3(double tauxO3) {
        this.tauxO3 = tauxO3;
    }

    public void setNiveau(NiveauPollution niveau) {
        this.niveau = niveau;
    }

    public void setDateReleve(Date dateReleve) {
        this.dateReleve = dateReleve;
    }
}