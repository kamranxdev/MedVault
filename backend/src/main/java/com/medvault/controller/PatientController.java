package com.medvault.controller;

import com.medvault.dto.PatientClinicalHistoryDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.*;
import com.medvault.repository.*;
import com.medvault.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AuditService auditService;

    public PatientController(PatientRepository patientRepository,
                             DiagnosisRepository diagnosisRepository,
                             AllergyRepository allergyRepository,
                             PrescriptionRepository prescriptionRepository,
                             VitalsRepository vitalsRepository,
                             MedicalRecordRepository medicalRecordRepository,
                             AuditService auditService) {
        this.patientRepository = patientRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR')")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR')")
    public List<Patient> searchPatients(@RequestParam("query") String query, Authentication auth) {
        auditService.logAction(auth, "READ", "PATIENT_MPI", null, "Executed Master Patient Index search for query: '" + query + "'");
        return patientRepository.searchPatients(query);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        auditService.logAction(auth, "READ", "PATIENT", String.valueOf(id), "Accessed patient demographic profile ID: " + id + " (" + patient.getFullName() + ")");
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}/clinical-history")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<PatientClinicalHistoryDTO> getPatientClinicalHistory(@PathVariable Long id, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        List<Diagnosis> pastIllnesses = diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Allergy> allergies = allergyRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(id);
        List<Vitals> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(id);

        PatientClinicalHistoryDTO historyDTO = new PatientClinicalHistoryDTO(
                patient,
                pastIllnesses,
                allergies,
                prescriptions,
                vitals,
                records
        );

        auditService.logAction(auth, "READ", "CLINICAL_HISTORY", String.valueOf(id), "Accessed longitudinal clinical history for patient ID: " + id);
        return ResponseEntity.ok(historyDTO);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@patientSecurityService.canAccessUser(authentication, #userId)")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId, Authentication auth) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No patient profile linked to user ID: " + userId));

        auditService.logAction(auth, "READ", "PATIENT_BY_USER", String.valueOf(userId), "Accessed patient profile linked to user ID: " + userId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, Authentication auth) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isEmpty()) {
            patient.setPatientCode("PAT-" + (1000 + (System.currentTimeMillis() % 9000)));
        }

        Patient saved = patientRepository.save(patient);
        auditService.logAction(auth, "CREATE", "PATIENT", String.valueOf(saved.getId()), "Created demographic identity profile for " + saved.getFullName() + " (MRN: " + saved.getPatientCode() + ")");

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient updated, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        boolean isPatientOnly = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))
                && auth.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_DOCTOR") || a.getAuthority().equals("ROLE_NURSE"));

        if (updated.getFullName() != null) patient.setFullName(updated.getFullName());
        if (updated.getPhone() != null) patient.setPhone(updated.getPhone());
        if (updated.getEmail() != null) patient.setEmail(updated.getEmail());
        if (updated.getAddress() != null) patient.setAddress(updated.getAddress());
        if (updated.getEmergencyContact() != null) patient.setEmergencyContact(updated.getEmergencyContact());

        if (updated.getDietaryHabits() != null) patient.setDietaryHabits(updated.getDietaryHabits());
        if (updated.getSmokingStatus() != null) patient.setSmokingStatus(updated.getSmokingStatus());
        if (updated.getAlcoholConsumption() != null) patient.setAlcoholConsumption(updated.getAlcoholConsumption());
        if (updated.getExerciseRoutine() != null) patient.setExerciseRoutine(updated.getExerciseRoutine());
        if (updated.getFoodAllergies() != null) patient.setFoodAllergies(updated.getFoodAllergies());

        if (updated.getInsuranceProvider() != null) patient.setInsuranceProvider(updated.getInsuranceProvider());
        if (updated.getInsurancePolicyNumber() != null) patient.setInsurancePolicyNumber(updated.getInsurancePolicyNumber());
        if (updated.getInsuranceGroupNumber() != null) patient.setInsuranceGroupNumber(updated.getInsuranceGroupNumber());
        if (updated.getCoveragePlan() != null) patient.setCoveragePlan(updated.getCoveragePlan());

        // Clinical fields can only be modified by clinical staff (ADMIN, DOCTOR, NURSE)
        if (!isPatientOnly) {
            if (updated.getSsn() != null) patient.setSsn(updated.getSsn());
            if (updated.getDateOfBirth() != null) patient.setDateOfBirth(updated.getDateOfBirth());
            if (updated.getGender() != null) patient.setGender(updated.getGender());
            if (updated.getBloodType() != null) patient.setBloodType(updated.getBloodType());
            if (updated.getMedicalAlerts() != null) patient.setMedicalAlerts(updated.getMedicalAlerts());

            if (updated.getPastMedicalHistory() != null) patient.setPastMedicalHistory(updated.getPastMedicalHistory());
            if (updated.getSeriousConditions() != null) patient.setSeriousConditions(updated.getSeriousConditions());
            if (updated.getSurgeriesAndProcedures() != null) patient.setSurgeriesAndProcedures(updated.getSurgeriesAndProcedures());
            if (updated.getFamilyMedicalHistory() != null) patient.setFamilyMedicalHistory(updated.getFamilyMedicalHistory());
        }

        Patient saved = patientRepository.save(patient);
        String auditMsg = isPatientOnly
                ? "Patient self-updated contact, insurance, & lifestyle details for patient ID: " + id
                : "Updated demographic, habits, & clinical profile for patient ID: " + id;
        auditService.logAction(auth, "UPDATE", "PATIENT", String.valueOf(id), auditMsg);

        return ResponseEntity.ok(saved);
    }
}
