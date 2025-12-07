package com.smartcity.orchestrator_service.dto;

import lombok.Data;

@Data
public class SosRequest {
    private String type; // Ex: "INCENDIE", "ACCIDENT_ROUTE"
    private String description;
    private double latitude;
    private double longitude;
    private String citoyenId;
}