package com.smartcity.mobility_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartcity.mobility_service.model.enums.StatusTrafic;
import com.smartcity.mobility_service.model.enums.TypeTransport;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "trajets")
@Data // Génère Getters, Setters, ToString, EqualsAndHashCode
@NoArgsConstructor // Constructeur vide (Obligatoire pour JPA)
@AllArgsConstructor // Constructeur complet (Utile pour le Seeder)
@Builder // Pattern Builder (Pratique pour créer des objets)
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le point de départ est obligatoire")
    @Column(nullable = false)
    private String depart;

    @NotBlank(message = "La destination est obligatoire")
    @Column(nullable = false)
    private String destination;

    @NotNull(message = "Le type de transport est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransport typeTransport;

    @Min(value = 1, message = "La durée doit être d'au moins 1 min")
    @Max(value = 1440, message = "La durée ne peut excéder 24h")
    @Column(nullable = false)
    private int dureeEstimee; // en minutes

    @NotNull(message = "Le statut du trafic est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTrafic statusTrafic;

    // Champ virtuel pour le Frontend (Lecture seule)
    // Exemple de sortie JSON : "dureeLisible": "1h 15min"
    @JsonProperty("dureeLisible")
    public String getDureeLisible() {
        int h = dureeEstimee / 60;
        int m = dureeEstimee % 60;
        return h == 0 ? m + " min" : String.format("%dh %02dmin", h, m);
    }
}