package com.medvault.dto;

import com.medvault.model.Allergy;
import com.medvault.model.Diagnosis;
import com.medvault.model.MedicalRecord;
import com.medvault.model.Patient;
import com.medvault.model.Prescription;
import com.medvault.model.Vitals;

import java.util.List;

public class PatientClinicalHistoryDTO {
    private Patient patient;
    private List<Diagnosis> pastIllnesses;
    private List<Allergy> allergies;
    private List<Prescription> prescriptions;
    private List<Vitals> vitals;
    private List<MedicalRecord> medicalRecords;
    
    private String habitsSummary;
    private String foodAllergiesSummary;
    private String seriousConditionsSummary;
    private String surgeriesSummary;

    public PatientClinicalHistoryDTO() {}

    public PatientClinicalHistoryDTO(Patient patient,
                                     List<Diagnosis> pastIllnesses,
                                     List<Allergy> allergies,
                                     List<Prescription> prescriptions,
                                     List<Vitals> vitals,
                                     List<MedicalRecord> medicalRecords) {
        this.patient = patient;
        this.pastIllnesses = pastIllnesses;
        this.allergies = allergies;
        this.prescriptions = prescriptions;
        this.vitals = vitals;
        this.medicalRecords = medicalRecords;

        if (patient != null) {
            this.habitsSummary = buildHabitsSummary(patient);
            this.foodAllergiesSummary = patient.getFoodAllergies();
            this.seriousConditionsSummary = patient.getSeriousConditions();
            this.surgeriesSummary = patient.getSurgeriesAndProcedures();
        }
    }

    private String buildHabitsSummary(Patient p) {
        StringBuilder sb = new StringBuilder();
        if (p.getDietaryHabits() != null && !p.getDietaryHabits().isEmpty()) sb.append("Diet: ").append(p.getDietaryHabits()).append("; ");
        if (p.getSmokingStatus() != null && !p.getSmokingStatus().isEmpty()) sb.append("Smoking: ").append(p.getSmokingStatus()).append("; ");
        if (p.getAlcoholConsumption() != null && !p.getAlcoholConsumption().isEmpty()) sb.append("Alcohol: ").append(p.getAlcoholConsumption()).append("; ");
        if (p.getExerciseRoutine() != null && !p.getExerciseRoutine().isEmpty()) sb.append("Exercise: ").append(p.getExerciseRoutine()).append("; ");
        return sb.toString().trim();
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public List<Diagnosis> getPastIllnesses() {
        return pastIllnesses;
    }

    public void setPastIllnesses(List<Diagnosis> pastIllnesses) {
        this.pastIllnesses = pastIllnesses;
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }

    public void setAllergies(List<Allergy> allergies) {
        this.allergies = allergies;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<Vitals> getVitals() {
        return vitals;
    }

    public void setVitals(List<Vitals> vitals) {
        this.vitals = vitals;
    }

    public List<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public void setMedicalRecords(List<MedicalRecord> medicalRecords) {
        this.medicalRecords = medicalRecords;
    }

    public String getHabitsSummary() {
        return habitsSummary;
    }

    public void setHabitsSummary(String habitsSummary) {
        this.habitsSummary = habitsSummary;
    }

    public String getFoodAllergiesSummary() {
        return foodAllergiesSummary;
    }

    public void setFoodAllergiesSummary(String foodAllergiesSummary) {
        this.foodAllergiesSummary = foodAllergiesSummary;
    }

    public String getSeriousConditionsSummary() {
        return seriousConditionsSummary;
    }

    public void setSeriousConditionsSummary(String seriousConditionsSummary) {
        this.seriousConditionsSummary = seriousConditionsSummary;
    }

    public String getSurgeriesSummary() {
        return surgeriesSummary;
    }

    public void setSurgeriesSummary(String surgeriesSummary) {
        this.surgeriesSummary = surgeriesSummary;
    }
}
