package com.smartcity.auth_service.config;

import com.smartcity.auth_service.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Récupérer le Header "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Si pas de header ou ne commence pas par "Bearer ", on passe au suivant
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraire le token (on enlève "Bearer " qui fait 7 caractères)
        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        // 3. Si on a un username et que l'utilisateur n'est pas encore authentifié
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // On charge l'utilisateur depuis la DB
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 4. On valide le token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // C'est ICI qu'on dit à Spring Security : "C'est bon, c'est lui !"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities() // C'est ici que le Rôle (ADMIN) est chargé
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Mise à jour du contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // On continue la chaîne
        filterChain.doFilter(request, response);
    }
}