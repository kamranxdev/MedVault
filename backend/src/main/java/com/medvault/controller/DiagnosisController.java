package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Diagnosis;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnoses")
public class DiagnosisController {

    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DiagnosisController(DiagnosisRepository diagnosisRepository,
                                PatientRepository patientRepository,
                                UserRepository userRepository,
                                AuditService auditService) {
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<Diagnosis> getDiagnosesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "DIAGNOSIS", String.valueOf(patientId), "Accessed coded problem list & diagnoses for patient ID: " + patientId);
        return diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createDiagnosis(@RequestBody Diagnosis diagnosis, Authentication auth) {
        if (diagnosis.getPatient() == null || diagnosis.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(diagnosis.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + diagnosis.getPatient().getId() + " not found"));

        diagnosis.setDoctor(doctor);
        diagnosis.setPatient(patient);

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        auditService.logAction(auth, "CREATE", "DIAGNOSIS", String.valueOf(saved.getId()), "Logged ICD-10 diagnosis (" + saved.getConditionName() + " - " + saved.getIcdCode() + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateDiagnosisStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Diagnosis diag = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis record with ID " + id + " not found"));

        diag.setStatus(status);
        Diagnosis saved = diagnosisRepository.save(diag);
        auditService.logAction(auth, "UPDATE", "DIAGNOSIS", String.valueOf(id), "Updated diagnosis lifecycle status to " + status + " for ID: " + id);

        return ResponseEntity.ok(saved);
    }
}
