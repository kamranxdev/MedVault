package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Encounter;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.EncounterRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encounters")
public class EncounterController {

    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public EncounterController(EncounterRepository encounterRepository,
                                PatientRepository patientRepository,
                                UserRepository userRepository,
                                AuditService auditService) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Encounter> getEncountersByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ENCOUNTER", String.valueOf(patientId), "Accessed encounter & visit log history for patient ID: " + patientId);
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and (#encounter != null and #encounter.patient != null and #encounter.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #encounter.patient.id))")
    public ResponseEntity<?> createEncounter(@RequestBody Encounter encounter, Authentication auth) {
        if (encounter.getPatient() == null || encounter.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User provider = userRepository.findByUsername(auth.getName()).orElse(null);
        Patient patient = patientRepository.findById(encounter.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + encounter.getPatient().getId() + " not found"));

        if (encounter.getAttendingProvider() == null || encounter.getAttendingProvider().getId() == null) {
            encounter.setAttendingProvider(provider);
        } else {
            User assigned = userRepository.findById(encounter.getAttendingProvider().getId()).orElse(provider);
            encounter.setAttendingProvider(assigned);
        }
        encounter.setPatient(patient);

        Encounter saved = encounterRepository.save(encounter);
        auditService.logAction(auth, "CREATE", "ENCOUNTER", String.valueOf(saved.getId()), "Logged new " + saved.getEncounterType() + " encounter for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and @patientSecurityService.canAccessEncounter(authentication, #id)")
    public ResponseEntity<?> updateEncounter(@PathVariable Long id, @RequestBody Encounter updated, Authentication auth) {
        Encounter enc = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter record with ID " + id + " not found"));

        if (updated.getClinicalNotes() != null) enc.setClinicalNotes(updated.getClinicalNotes());
        if (updated.getDischargeSummary() != null) enc.setDischargeSummary(updated.getDischargeSummary());
        if (updated.getStatus() != null) enc.setStatus(updated.getStatus());

        Encounter saved = encounterRepository.save(enc);
        auditService.logAction(auth, "UPDATE", "ENCOUNTER", String.valueOf(id), "Updated encounter details / clinical notes for ID: " + id);

        return ResponseEntity.ok(saved);
    }
}
