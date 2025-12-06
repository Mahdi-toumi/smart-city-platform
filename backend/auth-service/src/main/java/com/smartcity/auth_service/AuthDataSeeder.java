package com.smartcity.auth_service;

import com.smartcity.auth_service.entity.Role;
import com.smartcity.auth_service.entity.UserCredential;
import com.smartcity.auth_service.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthDataSeeder implements CommandLineRunner {

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;


    // Injection des valeurs depuis la configuration (application.properties ou Docker)
    private final String adminUsername = System.getenv("ADMIN_USERNAME");

    private final String adminPassword = System.getenv("ADMIN_SECURE_PASSWORD");;

    @Override
    public void run(String... args) {
        if (repository.findByUsername(adminUsername).isEmpty()) {

            UserCredential admin = UserCredential.builder()
                    .username(adminUsername) // Utilise la variable
                    .password(passwordEncoder.encode(adminPassword)) // Utilise la variable
                    .role(Role.ADMIN)
                    .email("admin@smartcity.com")
                    .nomComplet("Super Administrateur")
                    .adresse("Mairie Centrale")
                    .build();

            repository.save(admin);
            System.out.println(" Compte ADMIN créé : User=" + adminUsername);
        }
    }
}