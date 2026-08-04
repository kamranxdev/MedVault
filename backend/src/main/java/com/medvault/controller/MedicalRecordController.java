package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.MedicalRecord;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    private final MedicalRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MedicalRecordController(MedicalRecordRepository recordRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditService auditService) {
        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<MedicalRecord> getRecordsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "MEDICAL_RECORD", String.valueOf(patientId), "Fetched medical history for patient ID: " + patientId);
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createRecord(@RequestBody MedicalRecord record, Authentication auth) {
        if (record.getPatient() == null || record.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + record.getPatient().getId() + " not found"));

        record.setDoctor(doctor);
        record.setPatient(patient);

        MedicalRecord saved = recordRepository.save(record);
        auditService.logAction(auth, "CREATE", "MEDICAL_RECORD", String.valueOf(saved.getId()), "Created clinical encounter note for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }
}
