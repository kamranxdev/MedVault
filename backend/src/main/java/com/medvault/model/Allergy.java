package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "allergies")
public class Allergy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String allergenName;

    private String allergenCode; // SNOMED-CT or RxNorm code

    @Column(nullable = false)
    private String category; // DRUG, FOOD, ENVIRONMENTAL, OTHER

    @Column(nullable = false)
    private String severity; // MILD, MODERATE, SEVERE, LIFE_THREATENING

    @Column(length = 1000)
    private String reactionDescription;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE, RESOLVED

    @ManyToOne
    @JoinColumn(name = "recorded_by_id")
    private User recordedBy;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public Allergy() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getAllergenName() {
        return allergenName;
    }

    public void setAllergenName(String allergenName) {
        this.allergenName = allergenName;
    }

    public String getAllergenCode() {
        return allergenCode;
    }

    public void setAllergenCode(String allergenCode) {
        this.allergenCode = allergenCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getReactionDescription() {
        return reactionDescription;
    }

    public void setReactionDescription(String reactionDescription) {
        this.reactionDescription = reactionDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
