package com.smartcity.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 1. Vérification présence Header (Code existant...)
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Header manquant");
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }

            try {
                // 2. Validation signature
                jwtUtil.validateToken(authHeader);

                // 3. --- NOUVEAU : VÉRIFICATION DU RÔLE ---
                if (config.getRole() != null) {
                    String userRole = jwtUtil.extractRole(authHeader);

                    // Si le rôle requis est ADMIN mais que l'user est CITOYEN -> Erreur
                    if (!config.getRole().equals(userRole)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit : Rôle " + config.getRole() + " requis");
                    }
                }

            } catch (ResponseStatusException e) {
                throw e; // On relance les erreurs HTTP spécifiques
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalide");
            }

            return chain.filter(exchange);
        };
    }

    // --- CONFIGURATION ---
    public static class Config {
        private String role; // Le rôle qu'on va écrire dans le YAML

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}