package com.smartcity.air_quality_service.exception;

import jakarta.xml.ws.WebFault;

@WebFault(name = "VilleInconnueFault", targetNamespace = "http://smartcity.com/air-quality")
public class VilleInconnueException extends Exception {

    public VilleInconnueException(String message) {
        super(message);
    }

    public VilleInconnueException(String message, Throwable cause) {
        super(message, cause);
    }
}