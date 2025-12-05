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
@Data
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
    @JsonProperty("dureeLisible")
    public String getDureeLisible() {
        int h = dureeEstimee / 60;
        int m = dureeEstimee % 60;
        return h == 0 ? m + " min" : String.format("%dh %02dmin", h, m);
    }

    public Trajet() {}

    public Trajet(Long id, String depart, String destination, int dureeEstimee, TypeTransport typeTransport, StatusTrafic statusTrafic) {
        this.id = id;
        this.depart = depart;
        this.destination = destination;
        this.dureeEstimee = dureeEstimee;
        this.typeTransport = typeTransport;
        this.statusTrafic = statusTrafic;
    }

    public Long getId() {
        return id;
    }

    public @NotBlank(message = "Le point de départ est obligatoire") String getDepart() {
        return depart;
    }

    public @NotBlank(message = "La destination est obligatoire") String getDestination() {
        return destination;
    }

    public @NotNull(message = "Le type de transport est obligatoire") TypeTransport getTypeTransport() {
        return typeTransport;
    }

    @Min(value = 1, message = "La durée doit être d'au moins 1 min")
    @Max(value = 1440, message = "La durée ne peut excéder 24h")
    public int getDureeEstimee() {
        return dureeEstimee;
    }

    public @NotNull(message = "Le statut du trafic est obligatoire") StatusTrafic getStatusTrafic() {
        return statusTrafic;
    }

    public void setDepart(@NotBlank(message = "Le point de départ est obligatoire") String depart) {
        this.depart = depart;
    }

    public void setDestination(@NotBlank(message = "La destination est obligatoire") String destination) {
        this.destination = destination;
    }

    public void setTypeTransport(@NotNull(message = "Le type de transport est obligatoire") TypeTransport typeTransport) {
        this.typeTransport = typeTransport;
    }

    public void setDureeEstimee(@Min(value = 1, message = "La durée doit être d'au moins 1 min") @Max(value = 1440, message = "La durée ne peut excéder 24h") int dureeEstimee) {
        this.dureeEstimee = dureeEstimee;
    }

    public void setStatusTrafic(@NotNull(message = "Le statut du trafic est obligatoire") StatusTrafic statusTrafic) {
        this.statusTrafic = statusTrafic;
    }
}