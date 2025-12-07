package com.smartcity.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Autoriser ton Frontend (Vite utilise souvent 5173, React classique 3000)
        // On met "*" pour le développement pour être tranquille
        corsConfig.setAllowedOriginPatterns(Collections.singletonList("*"));

        corsConfig.setMaxAge(3600L); // Cache la config pendant 1h
        corsConfig.addAllowedMethod("*"); // GET, POST, PUT, DELETE, OPTIONS
        corsConfig.addAllowedHeader("*"); // Authorization, Content-Type...
        corsConfig.setAllowCredentials(true); // Important si on envoie des cookies/headers auth

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}