package com.smartcity.orchestrator_service.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UrgenceDto {
    private String type;
    private String description;
    private double latitude;
    private double longitude;
    // On ne met pas tout, juste ce qui intéresse l'affichage historique
}
