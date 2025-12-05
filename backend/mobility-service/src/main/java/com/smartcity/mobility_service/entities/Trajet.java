package com.smartcity.mobility_service.entities;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartcity.mobility_service.entities.enums.EtatTrafic;
import com.smartcity.mobility_service.entities.enums.TypeTransport;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Data


public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String depart;

    @Column(nullable = false)
    private String destination;

    @Enumerated(EnumType.STRING) // Stocke "BUS" en base au lieu de 0
    @Column(nullable = false)
    private TypeTransport typeTransport;

    // Validation : pas de durée négative !
    @Column(nullable = false)
    @Min(value = 1, message = "La durée du trajet doit être d'au moins 1 minute")
    @Max(value = 1440, message = "La durée ne peut pas excéder 24h (1440 min)")
    private int dureeEstimee; //Durée en minutes

    @Enumerated(EnumType.STRING)
    private EtatTrafic etatTrafic;





    // --- CHAMP CALCULÉ (Virtuel) ---
    // Ce champ sera visible dans le JSON (GET) mais n'est pas stocké en BDD.
    // Il permet au Frontend d'avoir un format lisible direct.

    @JsonProperty("dureeLisible") // Nom du champ dans le JSON
    public String getDureeLisible() {
        int heures = dureeEstimee / 60;
        int minutes = dureeEstimee % 60;

        if (heures == 0) {
            return minutes + " min";
        } else {
            // Format "2h 05min" (le %02d ajoute un 0 devant si < 10)
            return String.format("%dh %02dmin", heures, minutes);
        }
    }

    public Trajet() {
    }

    public Trajet(Long id, String destination, String depart, TypeTransport typeTransport, int dureeEstimee, EtatTrafic etatTrafic) {
        this.id = id;
        this.destination = destination;
        this.depart = depart;
        this.typeTransport = typeTransport;
        this.dureeEstimee = dureeEstimee;
        this.etatTrafic = etatTrafic;
    }

    public Long getId() {
        return id;
    }

    public String getDepart() {
        return depart;
    }

    public String getDestination() {
        return destination;
    }

    public TypeTransport getTypeTransport() {
        return typeTransport;
    }

    @Min(value = 1, message = "La durée du trajet doit être d'au moins 1 minute")
    @Max(value = 1440, message = "La durée ne peut pas excéder 24h (1440 min)")
    public int getDureeEstimee() {
        return dureeEstimee;
    }

    public EtatTrafic getEtatTrafic() {
        return etatTrafic;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDepart(String depart) {
        this.depart = depart;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public void setDureeEstimee(@Min(value = 1, message = "La durée du trajet doit être d'au moins 1 minute") @Max(value = 1440, message = "La durée ne peut pas excéder 24h (1440 min)") int dureeEstimee) {
        this.dureeEstimee = dureeEstimee;
    }

    public void setTypeTransport(TypeTransport typeTransport) {
        this.typeTransport = typeTransport;
    }

    public void setEtatTrafic(EtatTrafic etatTrafic) {
        this.etatTrafic = etatTrafic;
    }
}