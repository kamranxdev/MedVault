package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "encounters")
public class Encounter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "attending_provider_id", nullable = false)
    private User attendingProvider;

    @Column(nullable = false)
    private String encounterType; // INPATIENT, OUTPATIENT, EMERGENCY, TELEHEALTH

    @Column(length = 1000)
    private String chiefComplaint;

    @Column(length = 3000)
    private String clinicalNotes;

    @Column(length = 3000)
    private String dischargeSummary;

    private String status = "ACTIVE"; // ACTIVE, COMPLETED, DISCHARGED

    private LocalDateTime encounterDate = LocalDateTime.now();

    public Encounter() {}

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

    public User getAttendingProvider() {
        return attendingProvider;
    }

    public void setAttendingProvider(User attendingProvider) {
        this.attendingProvider = attendingProvider;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getDischargeSummary() {
        return dischargeSummary;
    }

    public void setDischargeSummary(String dischargeSummary) {
        this.dischargeSummary = dischargeSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getEncounterDate() {
        return encounterDate;
    }

    public void setEncounterDate(LocalDateTime encounterDate) {
        this.encounterDate = encounterDate;
    }
}
