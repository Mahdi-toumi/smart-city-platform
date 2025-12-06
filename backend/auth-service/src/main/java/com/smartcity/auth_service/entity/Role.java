package com.smartcity.auth_service.entity;

public enum Role {
    CITOYEN,    // Accès standard
    MAIRE,      // Accès statistiques et validation
    ADMIN,      // Accès technique total
    URGENCE     // Accès services de secours
}