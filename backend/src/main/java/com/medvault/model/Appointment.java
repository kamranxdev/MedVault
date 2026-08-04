package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false)
    private LocalDateTime appointmentDate;

    private String status = "SCHEDULED"; // SCHEDULED, CHECKED_IN, TRIAGED, IN_CONSULTATION, COMPLETED, CANCELLED

    private String stage = "SCHEDULED"; // SCHEDULED, CHECKED_IN, TRIAGED, IN_CONSULTATION, COMPLETED, CANCELLED

    private String reason;

    @Column(length = 1000)
    private String notes;

    @Column(name = "insurance_verified")
    private Boolean insuranceVerified = false;

    @Column(name = "insurance_details", length = 1000)
    private String insuranceDetails;

    @Column(name = "reports_uploaded", length = 2000)
    private String reportsUploaded;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @ManyToOne
    @JoinColumn(name = "vitals_id")
    private Vitals vitals;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Appointment() {}

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

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        if (this.stage == null || "SCHEDULED".equals(this.stage)) {
            this.stage = status;
        }
    }

    public String getStage() {
        return stage != null ? stage : status;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getInsuranceVerified() {
        return insuranceVerified;
    }

    public void setInsuranceVerified(Boolean insuranceVerified) {
        this.insuranceVerified = insuranceVerified;
    }

    public String getInsuranceDetails() {
        return insuranceDetails;
    }

    public void setInsuranceDetails(String insuranceDetails) {
        this.insuranceDetails = insuranceDetails;
    }

    public String getReportsUploaded() {
        return reportsUploaded;
    }

    public void setReportsUploaded(String reportsUploaded) {
        this.reportsUploaded = reportsUploaded;
    }

    public LocalDateTime getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDateTime followUpDate) {
        this.followUpDate = followUpDate;
    }

    public Vitals getVitals() {
        return vitals;
    }

    public void setVitals(Vitals vitals) {
        this.vitals = vitals;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
