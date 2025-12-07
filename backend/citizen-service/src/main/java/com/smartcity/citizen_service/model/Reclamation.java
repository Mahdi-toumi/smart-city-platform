package com.smartcity.citizen_service.model;

import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.model.enums.TypeReclamation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "reclamations")
@Data // Lombok gère Getters/Setters/ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "L'ID du citoyen est obligatoire")
    private String citoyenId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeReclamation type;

    @NotBlank(message = "La description est obligatoire")
    @Column(length = 500)
    private String description;

    private String adresse;

    @Enumerated(EnumType.STRING)
    private StatutReclamation statut;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateTraitement;

    // Initialisation automatique avant insertion en base
    @PrePersist
    protected void onCreate() {
        this.dateCreation = new Date();
        if (this.statut == null) {
            this.statut = StatutReclamation.OUVERTE;
        }
    }
}