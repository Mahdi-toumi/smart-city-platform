package com.smartcity.orchestrator_service.config;

import io.grpc.StatusRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.ws.soap.client.SoapFaultClientException;

import java.util.Map;
import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Erreur gRPC (Service Python inaccessible ou erreur interne Python)
    @ExceptionHandler(StatusRuntimeException.class)
    public ResponseEntity<Map<String, String>> handleGrpcException(StatusRuntimeException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "erreur", "Service d'urgence indisponible",
                        "details", ex.getStatus().getDescription() != null ? ex.getStatus().getDescription() : "Erreur RPC"
                ));
    }

    // Erreur SOAP (Zone inconnue ou erreur Service Java)
    @ExceptionHandler(SoapFaultClientException.class)
    public ResponseEntity<Map<String, String>> handleSoapException(SoapFaultClientException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "erreur", "Erreur Service Qualité Air",
                        "details", Objects.requireNonNull(ex.getFaultStringOrReason())
                ));
    }

    // Erreur générique
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erreur", "Erreur interne de l'orchestrateur", "details", ex.getMessage()));
    }
}