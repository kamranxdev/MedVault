package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.model.Vitals;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.repository.VitalsRepository;
import com.medvault.service.AuditService;
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
    private final AuditService auditService;

    public VitalsController(VitalsRepository vitalsRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository,
                            AuditService auditService) {
        this.vitalsRepository = vitalsRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<Vitals> getVitalsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "VITALS", String.valueOf(patientId), "Accessed physiological vitals for patient ID: " + patientId);
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> recordVitals(@RequestBody Vitals vitals, Authentication auth) {
        if (vitals.getPatient() == null || vitals.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User staff = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Staff user profile not found"));
        Patient patient = patientRepository.findById(vitals.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + vitals.getPatient().getId() + " not found"));

        vitals.setRecordedBy(staff);
        vitals.setPatient(patient);

        Vitals saved = vitalsRepository.save(vitals);
        auditService.logAction(auth, "CREATE", "VITALS", String.valueOf(saved.getId()), 
                "Recorded vital signs (BP: " + saved.getBloodPressure() + ", Pulse: " + saved.getHeartRate() 
                + " bpm, Glucose: " + (saved.getBloodGlucose() != null ? saved.getBloodGlucose() + " mg/dL" : "N/A") 
                + ", BMI: " + (saved.getBmi() != null ? saved.getBmi() : "N/A") + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }
}
