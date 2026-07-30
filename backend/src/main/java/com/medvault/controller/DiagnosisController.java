package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.Diagnosis;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
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
    private final AuditLogRepository auditLogRepository;

    public DiagnosisController(DiagnosisRepository diagnosisRepository,
                               PatientRepository patientRepository,
                               UserRepository userRepository,
                               AuditLogRepository auditLogRepository) {
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'AUDITOR', 'PATIENT')")
    public List<Diagnosis> getDiagnosesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "DIAGNOSIS",
                String.valueOf(patientId),
                "Accessed coded problem list & diagnoses for patient ID: " + patientId
        ));
        return diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createDiagnosis(@RequestBody Diagnosis diagnosis, Authentication auth) {
        User doctor = userRepository.findByUsername(auth.getName()).orElseThrow();
        Patient patient = patientRepository.findById(diagnosis.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        diagnosis.setDoctor(doctor);
        diagnosis.setPatient(patient);

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                "ROLE_DOCTOR",
                "CREATE",
                "DIAGNOSIS",
                String.valueOf(saved.getId()),
                "Logged ICD-10 diagnosis (" + saved.getConditionName() + " - " + saved.getIcdCode() + ") for patient ID: " + patient.getId()
        ));

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateDiagnosisStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        return diagnosisRepository.findById(id)
                .map(diag -> {
                    diag.setStatus(status);
                    Diagnosis saved = diagnosisRepository.save(diag);
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            "ROLE_DOCTOR",
                            "UPDATE",
                            "DIAGNOSIS",
                            String.valueOf(id),
                            "Updated diagnosis lifecycle status to " + status + " for ID: " + id
                    ));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
