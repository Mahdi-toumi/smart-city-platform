package com.smartcity.air_quality_service.config;


import com.smartcity.air_quality_service.service.AirQualityService;
import com.smartcity.air_quality_service.service.AirQualityServiceImpl;
import org.apache.cxf.Bus;
import org.apache.cxf.jaxws.EndpointImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.xml.ws.Endpoint;

@Configuration
public class CxfConfig {

    @Autowired
    private Bus bus; // Le bus CXF gère les messages SOAP

    @Autowired
    private AirQualityServiceImpl airQualityService; // Notre logique métier

    /**
     * Cette méthode publie le service à l'adresse /services/air
     */
    @Bean
    public Endpoint endpoint() {
        EndpointImpl endpoint = new EndpointImpl(bus, airQualityService);
        endpoint.publish("/air"); // URL finale : http://localhost:8082/services/air
        return endpoint;
    }
}