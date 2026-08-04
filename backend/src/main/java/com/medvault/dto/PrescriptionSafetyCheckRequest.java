package com.medvault.dto;

public class PrescriptionSafetyCheckRequest {
    private Long patientId;
    private String medicationName;
    private String dosage;
    private String instructions;

    public PrescriptionSafetyCheckRequest() {}

    public PrescriptionSafetyCheckRequest(Long patientId, String medicationName, String dosage, String instructions) {
        this.patientId = patientId;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.instructions = instructions;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
