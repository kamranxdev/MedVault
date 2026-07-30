package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.MedicalRecord;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
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
    private final AuditLogRepository auditLogRepository;

    public MedicalRecordController(MedicalRecordRepository recordRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditLogRepository auditLogRepository) {
        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'PATIENT')")
    public List<MedicalRecord> getRecordsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "MEDICAL_RECORD",
                "Fetched medical history for patient ID: " + patientId
        ));
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createRecord(@RequestBody MedicalRecord record, Authentication auth) {
        User doctor = userRepository.findByUsername(auth.getName()).orElseThrow();
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        record.setDoctor(doctor);
        record.setPatient(patient);

        MedicalRecord saved = recordRepository.save(record);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                "ROLE_DOCTOR",
                "CREATE",
                "MEDICAL_RECORD",
                "Created diagnosis & clinical encounter note for patient ID: " + patient.getId()
        ));

        return ResponseEntity.ok(saved);
    }
}
