package com.smartcity.air_quality_service.model;

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
@NoArgsConstructor
@AllArgsConstructor
@XmlRootElement(name = "ReleveAir")
@XmlAccessorType(XmlAccessType.FIELD)
public class ReleveAir {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String zone;

    private double indexAQI;
    private double tauxCO2;
    private double tauxNO2;
    private double tauxO3;

    @Enumerated(EnumType.STRING)
    private NiveauPollution niveau;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateReleve;

    public void calculerNiveau() {
        if (indexAQI < 50) this.niveau = NiveauPollution.BON;
        else if (indexAQI < 100) this.niveau = NiveauPollution.MOYEN;
        else if (indexAQI < 150) this.niveau = NiveauPollution.DEGRADE;
        else if (indexAQI < 200) this.niveau = NiveauPollution.MAUVAIS;
        else this.niveau = NiveauPollution.DANGEREUX;
    }
}