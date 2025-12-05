package com.smartcity.air_quality_service.model;


import jakarta.xml.bind.annotation.XmlEnum;
import jakarta.xml.bind.annotation.XmlType;

@XmlType(name = "NiveauPollution")
@XmlEnum
public enum NiveauPollution {
    BON,            // Vert
    MOYEN,          // Jaune
    DEGRADE,        // Orange
    MAUVAIS,        // Rouge
    DANGEREUX       // Violet (Alerte sanitaire)
}