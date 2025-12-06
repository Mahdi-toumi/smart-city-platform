package com.smartcity.auth_service.controller;

import com.smartcity.auth_service.entity.dto.AuthRequest;
import com.smartcity.auth_service.entity.dto.AuthResponse;
import com.smartcity.auth_service.entity.dto.RegisterRequest;
import com.smartcity.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}