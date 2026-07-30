package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.model.Vitals;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.repository.VitalsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vitals")
public class VitalsController {

    private final VitalsRepository vitalsRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public VitalsController(VitalsRepository vitalsRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository,
                            AuditLogRepository auditLogRepository) {
        this.vitalsRepository = vitalsRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<Vitals> getVitalsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "VITALS",
                String.valueOf(patientId),
                "Accessed longitudinal time-series physiological vitals for patient ID: " + patientId
        ));
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> recordVitals(@RequestBody Vitals vitals, Authentication auth) {
        User staff = userRepository.findByUsername(auth.getName()).orElseThrow();
        Patient patient = patientRepository.findById(vitals.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        vitals.setRecordedBy(staff);
        vitals.setPatient(patient);

        Vitals saved = vitalsRepository.save(vitals);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "CREATE",
                "VITALS",
                String.valueOf(saved.getId()),
                "Recorded vital signs (BP: " + saved.getBloodPressure() + ", Pulse: " + saved.getHeartRate() 
                + " bpm, Glucose: " + (saved.getBloodGlucose() != null ? saved.getBloodGlucose() + " mg/dL" : "N/A") 
                + ", BMI: " + (saved.getBmi() != null ? saved.getBmi() : "N/A") + ") for patient ID: " + patient.getId()
        ));

        return ResponseEntity.ok(saved);
    }
}
