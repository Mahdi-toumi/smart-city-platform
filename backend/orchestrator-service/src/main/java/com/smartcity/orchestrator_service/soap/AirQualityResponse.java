package com.smartcity.orchestrator_service.soap;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "getQualiteAirResponse", namespace = "http://smartcity.com/air-quality")
public class AirQualityResponse {

    @XmlElement(name = "return", namespace = "")
    private ReleveAirData returnData;

    @Data
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class ReleveAirData {
        // Ces champs doivent correspondre aux attributs de ta classe ReleveAir (Service 2)
        private double indexAQI;
        private String niveau; // L'Enum sera reçu comme String (BON, MOYEN...)
        private double tauxCO2;

        // JAXB est sensible à la casse, assure-toi que les noms XML correspondent
        // Si ton service renvoie <dateReleve>, ajoute ce champ ici si besoin.
    }
}