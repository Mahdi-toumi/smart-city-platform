package com.smartcity.air_quality_service.service;

import com.smartcity.air_quality_service.exception.VilleInconnueException;
import com.smartcity.air_quality_service.model.ReleveAir;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

@WebService(targetNamespace = "http://smartcity.com/air-quality")
public interface AirQualityService {

    @WebMethod
    ReleveAir getQualiteAir(@WebParam(name = "zone") String zone) throws VilleInconnueException;
}