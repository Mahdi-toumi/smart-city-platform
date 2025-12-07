package com.smartcity.orchestrator_service.soap;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "getQualiteAir", namespace = "http://smartcity.com/air-quality")
public class AirQualityRequest {

    // En SOAP JAX-WS standard, le premier argument s'appelle souvent "arg0"
    // Si ça ne marche pas, essaie name="zone"
    @XmlElement(name = "zone", namespace = "")
    private String zone;
}