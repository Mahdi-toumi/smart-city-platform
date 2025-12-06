package com.smartcity.auth_service.entity.dto;

import com.smartcity.auth_service.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private Role role; // On utilise l'Enum directement ici !
    private String email;
    private String nomComplet;
    private String adresse;
}