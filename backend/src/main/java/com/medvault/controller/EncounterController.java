package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.Encounter;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.EncounterRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
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
    private final AuditLogRepository auditLogRepository;

    public EncounterController(EncounterRepository encounterRepository,
                               PatientRepository patientRepository,
                               UserRepository userRepository,
                               AuditLogRepository auditLogRepository) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<Encounter> getEncountersByPatient(@PathVariable Long patientId, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "ENCOUNTER",
                String.valueOf(patientId),
                "Accessed encounter & visit log history for patient ID: " + patientId
        ));
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<?> createEncounter(@RequestBody Encounter encounter, Authentication auth) {
        User provider = userRepository.findByUsername(auth.getName()).orElse(null);
        Patient patient = patientRepository.findById(encounter.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (encounter.getAttendingProvider() == null || encounter.getAttendingProvider().getId() == null) {
            encounter.setAttendingProvider(provider);
        } else {
            User assigned = userRepository.findById(encounter.getAttendingProvider().getId()).orElse(provider);
            encounter.setAttendingProvider(assigned);
        }
        encounter.setPatient(patient);

        Encounter saved = encounterRepository.save(encounter);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "CREATE",
                "ENCOUNTER",
                String.valueOf(saved.getId()),
                "Logged new " + saved.getEncounterType() + " encounter for patient ID: " + patient.getId()
        ));

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<?> updateEncounter(@PathVariable Long id, @RequestBody Encounter updated, Authentication auth) {
        return encounterRepository.findById(id)
                .map(enc -> {
                    if (updated.getClinicalNotes() != null) enc.setClinicalNotes(updated.getClinicalNotes());
                    if (updated.getDischargeSummary() != null) enc.setDischargeSummary(updated.getDischargeSummary());
                    if (updated.getStatus() != null) enc.setStatus(updated.getStatus());

                    Encounter saved = encounterRepository.save(enc);
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            auth.getAuthorities().toString(),
                            "UPDATE",
                            "ENCOUNTER",
                            String.valueOf(id),
                            "Updated encounter details / clinical notes for ID: " + id
                    ));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
