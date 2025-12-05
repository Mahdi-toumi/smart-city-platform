package com.smartcity.air_quality_service.service;

import com.smartcity.air_quality_service.exception.VilleInconnueException;
import com.smartcity.air_quality_service.model.DonneesAir;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

/**
 * Interface définissant les opérations SOAP disponibles.
 */
@WebService(targetNamespace = "http://smartcity.com/air-quality")
public interface AirQualityService {

    @WebMethod
    DonneesAir getQualiteAir(@WebParam(name = "ville") String ville) throws VilleInconnueException;
}