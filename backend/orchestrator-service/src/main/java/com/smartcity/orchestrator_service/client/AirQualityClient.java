package com.smartcity.orchestrator_service.client;

import com.smartcity.orchestrator_service.soap.AirQualityRequest;
import com.smartcity.orchestrator_service.soap.AirQualityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;

@Service
@RequiredArgsConstructor
public class AirQualityClient {

    private final WebServiceTemplate webServiceTemplate;

    public AirQualityResponse.ReleveAirData getAirQuality(String zone) {
        // 1. Création de la requête avec la ZONE
        AirQualityRequest request = new AirQualityRequest();
        request.setZone(zone);

        System.out.println("☁️ [Orchestrator] Appel SOAP pour la zone : " + zone);

        // 2. Appel SOAP
        AirQualityResponse response = (AirQualityResponse) webServiceTemplate
                .marshalSendAndReceive(request);

        return response.getReturnData();
    }
}