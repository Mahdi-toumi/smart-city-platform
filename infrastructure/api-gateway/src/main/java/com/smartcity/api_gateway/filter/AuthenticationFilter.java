package com.smartcity.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

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

            // 1. Vérifier la présence du Header Authorization
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Header Authorization manquant");
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }

            try {
                // 2. Valider la signature du Token
                jwtUtil.validateToken(authHeader);

                // 3. --- LOGIQUE MULTI-RÔLES CORRIGÉE ---
                if (config.getRole() != null && !config.getRole().isEmpty()) {
                    String userRole = jwtUtil.extractRole(authHeader);

                    // On découpe la configuration YAML par virgule (ex: "ADMIN,MAIRE")
                    String[] allowedRoles = config.getRole().split(",");

                    // On vérifie si le rôle de l'utilisateur est dans la liste
                    boolean isAuthorized = Arrays.asList(allowedRoles).contains(userRole);

                    if (!isAuthorized) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                "Accès interdit : Rôle insuffisant. Requis : " + config.getRole());
                    }
                }

            } catch (ResponseStatusException e) {
                throw e;
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalide ou expiré");
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {
        private String role;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}