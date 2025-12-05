package com.smartcity.air_quality_service.config;

import com.smartcity.air_quality_service.service.AirQualityService;
import jakarta.xml.ws.Endpoint;
import org.apache.cxf.Bus;
import org.apache.cxf.jaxws.EndpointImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CxfConfig {

    private final Bus bus;
    private final AirQualityService airQualityService;

    public CxfConfig(Bus bus, AirQualityService airQualityService) {
        this.bus = bus;
        this.airQualityService = airQualityService;
    }

    @Bean
    public Endpoint endpoint() {
        EndpointImpl endpoint = new EndpointImpl(bus, airQualityService);
        endpoint.publish("/air"); // URL finale : /services/air
        return endpoint;
    }
}