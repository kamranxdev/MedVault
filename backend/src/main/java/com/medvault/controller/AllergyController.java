package com.medvault.controller;

import com.medvault.model.Allergy;
import com.medvault.model.AuditLog;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AllergyRepository;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allergies")
public class AllergyController {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AllergyController(AllergyRepository allergyRepository,
                             PatientRepository patientRepository,
                             UserRepository userRepository,
                             AuditLogRepository auditLogRepository) {
        this.allergyRepository = allergyRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<Allergy> getAllergiesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "ALLERGY",
                String.valueOf(patientId),
                "Accessed allergy & contraindications profile for patient ID: " + patientId
        ));
        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> createAllergy(@RequestBody Allergy allergy, Authentication auth) {
        User clinician = userRepository.findByUsername(auth.getName()).orElseThrow();
        Patient patient = patientRepository.findById(allergy.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        allergy.setRecordedBy(clinician);
        allergy.setPatient(patient);

        Allergy saved = allergyRepository.save(allergy);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                "ROLE_DOCTOR",
                "CREATE",
                "ALLERGY",
                String.valueOf(saved.getId()),
                "Recorded " + saved.getSeverity() + " allergy to " + saved.getAllergenName() + " for patient ID: " + patient.getId()
        ));

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> updateAllergyStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        return allergyRepository.findById(id)
                .map(allergy -> {
                    allergy.setStatus(status);
                    Allergy saved = allergyRepository.save(allergy);
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            "ROLE_DOCTOR",
                            "UPDATE",
                            "ALLERGY",
                            String.valueOf(id),
                            "Updated allergy status to " + status + " for allergy ID: " + id
                    ));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
