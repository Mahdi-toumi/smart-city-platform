package com.smartcity.air_quality_service.model;

import jakarta.xml.bind.annotation.XmlEnum;
import jakarta.xml.bind.annotation.XmlType;

@XmlType(name = "NiveauAlerte")
@XmlEnum
public enum NiveauAlerte {
    BON("Air pur, idéal pour les activités."),
    MODERE("Qualité acceptable."),
    DEGRADE("Peut gêner les personnes sensibles."),
    MAUVAIS("Augmentation des symptômes respiratoires."),
    TRES_MAUVAIS("Éviter tout effort physique."),
    DANGEREUX("Alerte sanitaire : restez confinés.");

    private final String description;

    NiveauAlerte(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    // Logique métier intégrée à l'Enum
    public static NiveauAlerte fromIQA(double iqa) {
        if (iqa < 50) return BON;
        if (iqa < 100) return MODERE;
        if (iqa < 150) return DEGRADE;
        if (iqa < 200) return MAUVAIS;
        if (iqa < 300) return TRES_MAUVAIS;
        return DANGEREUX;
    }
}