package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_assignments")
public class PatientAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false)
    private User staffUser;

    @Column(nullable = false, length = 40)
    private String assignmentType; // ATTENDING_PHYSICIAN, ASSIGNED_NURSE, CONSULTING_SPECIALIST

    private LocalDateTime startDate = LocalDateTime.now();
    private LocalDateTime endDate;

    public PatientAssignment() {}

    public PatientAssignment(Patient patient, User staffUser, String assignmentType) {
        this.patient = patient;
        this.staffUser = staffUser;
        this.assignmentType = assignmentType;
    }

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

    public User getStaffUser() {
        return staffUser;
    }

    public void setStaffUser(User staffUser) {
        this.staffUser = staffUser;
    }

    public String getAssignmentType() {
        return assignmentType;
    }

    public void setAssignmentType(String assignmentType) {
        this.assignmentType = assignmentType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
