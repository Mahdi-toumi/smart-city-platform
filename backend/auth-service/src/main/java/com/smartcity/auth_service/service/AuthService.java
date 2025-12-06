package com.smartcity.auth_service.service;

import com.smartcity.auth_service.entity.dto.AuthResponse;
import com.smartcity.auth_service.entity.dto.RegisterRequest;
import com.smartcity.auth_service.entity.Role;
import com.smartcity.auth_service.entity.UserCredential;
import com.smartcity.auth_service.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Par défaut, si aucun rôle n'est donné, c'est un CITOYEN
        Role role = (request.getRole() != null) ? request.getRole() : Role.CITOYEN;

        var user = UserCredential.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // On chiffre le mot de passe
                .role(role)
                .email(request.getEmail())
                .nomComplet(request.getNomComplet())
                .adresse(request.getAdresse())
                .build();

        repository.save(user);

        // On génère le token immédiatement pour qu'il soit connecté
        var jwtToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder().token(jwtToken).build();
    }

    public AuthResponse authenticate(String username, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        var user = repository.findByUsername(username).orElseThrow();
        var jwtToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder().token(jwtToken).build();
    }

    // 1. Lister tous les utilisateurs (Mapping vers UserDto)
    public java.util.List<com.smartcity.auth_service.entity.dto.UserDto> getAllUsers() {
        return repository.findAll().stream()
                .map(user -> com.smartcity.auth_service.entity.dto.UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .nomComplet(user.getNomComplet())
                        .role(user.getRole())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    // 2. Supprimer un utilisateur
    public void deleteUser(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID : " + id);
        }
        repository.deleteById(id);
    }

    // 3. Changer le rôle (ex: Promouvoir un CITOYEN en ADMIN)
    public com.smartcity.auth_service.entity.dto.UserDto updateUserRole(Long id, Role newRole) {
        var user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setRole(newRole);
        repository.save(user);

        return com.smartcity.auth_service.entity.dto.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}