package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Allergy;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AllergyRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
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
    private final AuditService auditService;

    public AllergyController(AllergyRepository allergyRepository,
                             PatientRepository patientRepository,
                             UserRepository userRepository,
                             AuditService auditService) {
        this.allergyRepository = allergyRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<Allergy> getAllergiesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ALLERGY", String.valueOf(patientId), "Accessed allergy profile for patient ID: " + patientId);
        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> createAllergy(@RequestBody Allergy allergy, Authentication auth) {
        if (allergy.getPatient() == null || allergy.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User clinician = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Clinician user profile not found"));
        Patient patient = patientRepository.findById(allergy.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + allergy.getPatient().getId() + " not found"));

        allergy.setRecordedBy(clinician);
        allergy.setPatient(patient);

        Allergy saved = allergyRepository.save(allergy);
        auditService.logAction(auth, "CREATE", "ALLERGY", String.valueOf(saved.getId()), "Recorded " + saved.getSeverity() + " allergy to " + saved.getAllergenName() + " for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> updateAllergyStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Allergy allergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy record with ID " + id + " not found"));

        allergy.setStatus(status);
        Allergy saved = allergyRepository.save(allergy);
        auditService.logAction(auth, "UPDATE", "ALLERGY", String.valueOf(id), "Updated allergy status to " + status + " for allergy ID: " + id);

        return ResponseEntity.ok(saved);
    }
}
