package com.smartcity.auth_service.controller;

import com.smartcity.auth_service.entity.dto.AuthRequest;
import com.smartcity.auth_service.entity.dto.AuthResponse;
import com.smartcity.auth_service.entity.dto.RegisterRequest;
import com.smartcity.auth_service.entity.dto.UserDto; // Import UserDto
import com.smartcity.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // Import Important
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/token")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(service.authenticate(request.getUsername(), request.getPassword()));
    }

    // --- AJOUT POUR LE FRONTEND ---
    // GET /auth/me
    // Utilisé par React au chargement de la page pour savoir si on est Admin ou Citoyen
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        // Le JwtAuthenticationFilter a déjà validé le token et mis le username dans le contexte
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.getCurrentUser(username));
    }
}