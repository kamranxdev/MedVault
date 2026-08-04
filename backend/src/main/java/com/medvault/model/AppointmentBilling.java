package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_billings")
public class AppointmentBilling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "consultation_fee")
    private Double consultationFee = 100.0;

    @Column(name = "triage_fee")
    private Double triageFee = 25.0;

    @Column(name = "lab_fee")
    private Double labFee = 0.0;

    @Column(name = "pharmacy_fee")
    private Double pharmacyFee = 0.0;

    @Column(name = "insurance_coverage")
    private Double insuranceCoverage = 0.0;

    @Column(name = "net_payable")
    private Double netPayable = 125.0;

    @Column(name = "payment_status")
    private String paymentStatus = "PENDING"; // PENDING, PAID

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public AppointmentBilling() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getTriageFee() {
        return triageFee;
    }

    public void setTriageFee(Double triageFee) {
        this.triageFee = triageFee;
    }

    public Double getLabFee() {
        return labFee;
    }

    public void setLabFee(Double labFee) {
        this.labFee = labFee;
    }

    public Double getPharmacyFee() {
        return pharmacyFee;
    }

    public void setPharmacyFee(Double pharmacyFee) {
        this.pharmacyFee = pharmacyFee;
    }

    public Double getInsuranceCoverage() {
        return insuranceCoverage;
    }

    public void setInsuranceCoverage(Double insuranceCoverage) {
        this.insuranceCoverage = insuranceCoverage;
    }

    public Double getNetPayable() {
        return netPayable;
    }

    public void setNetPayable(Double netPayable) {
        this.netPayable = netPayable;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
