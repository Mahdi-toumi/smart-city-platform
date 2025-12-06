package com.smartcity.citizen_service.model;

import com.smartcity.citizen_service.model.enums.StatutReclamation;
import com.smartcity.citizen_service.model.enums.TypeReclamation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "reclamations")
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "L'ID du citoyen est obligatoire")
    private String citoyenId; // Lien vers le système d'Auth (simulé ici)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeReclamation type;

    @NotBlank(message = "La description est obligatoire")
    @Column(length = 500)
    private String description;

    private String adresse; // "Rue de la Liberté"

    @Enumerated(EnumType.STRING)
    private StatutReclamation statut;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateTraitement;

    // Callback avant insertion pour mettre les valeurs par défaut
    @PrePersist
    protected void onCreate() {
        this.dateCreation = new Date();
        if (this.statut == null) {
            this.statut = StatutReclamation.OUVERTE;
        }
    }

    public Reclamation() {
    }

    public Reclamation(Long id, String citoyenId, TypeReclamation type, String description, String adresse, StatutReclamation statut, Date dateCreation, Date dateTraitement) {
        this.id = id;
        this.citoyenId = citoyenId;
        this.type = type;
        this.description = description;
        this.adresse = adresse;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.dateTraitement = dateTraitement;
    }

    public Long getId() {
        return id;
    }

    public @NotBlank(message = "L'ID du citoyen est obligatoire") String getCitoyenId() {
        return citoyenId;
    }

    public TypeReclamation getType() {
        return type;
    }

    public @NotBlank(message = "La description est obligatoire") String getDescription() {
        return description;
    }

    public String getAdresse() {
        return adresse;
    }

    public StatutReclamation getStatut() {
        return statut;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public Date getDateTraitement() {
        return dateTraitement;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(TypeReclamation type) {
        this.type = type;
    }

    public void setCitoyenId(@NotBlank(message = "L'ID du citoyen est obligatoire") String citoyenId) {
        this.citoyenId = citoyenId;
    }

    public void setDescription(@NotBlank(message = "La description est obligatoire") String description) {
        this.description = description;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void setStatut(StatutReclamation statut) {
        this.statut = statut;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    public void setDateTraitement(Date dateTraitement) {
        this.dateTraitement = dateTraitement;
    }
}