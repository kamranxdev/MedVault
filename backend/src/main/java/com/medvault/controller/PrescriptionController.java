package com.medvault.controller;

import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Patient;
import com.medvault.model.Prescription;
import com.medvault.model.User;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.PrescriptionRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
import com.medvault.service.SmartSafetyService;
import com.medvault.service.SmartSafetyService.SafetyCheckResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SmartSafetyService safetyService;

    public PrescriptionController(PrescriptionRepository prescriptionRepository,
                                   PatientRepository patientRepository,
                                   UserRepository userRepository,
                                   AuditService auditService,
                                   SmartSafetyService safetyService) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.safetyService = safetyService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<Prescription> getPrescriptionsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "PRESCRIPTION", String.valueOf(patientId), "Accessed eRx prescription history for patient ID: " + patientId);
        return prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId);
    }

    @PostMapping("/safety-check")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<SafetyCheckResult> checkSafety(@RequestBody Map<String, Object> body, Authentication auth) {
        if (!body.containsKey("patientId") || !body.containsKey("medicationName")) {
            throw new IllegalArgumentException("patientId and medicationName are required fields");
        }

        Long patientId = Long.parseLong(body.get("patientId").toString());
        String medicationName = body.get("medicationName").toString();

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(
                patientId, 
                medicationName, 
                auth.getName(), 
                "ROLE_DOCTOR"
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/validate-safety")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<SafetyCheckResult> validatePrescriptionSafety(@RequestBody com.medvault.dto.PrescriptionSafetyCheckRequest request, Authentication auth) {
        if (request.getPatientId() == null || request.getMedicationName() == null) {
            throw new IllegalArgumentException("patientId and medicationName are required for safety validation");
        }

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(
                request.getPatientId(),
                request.getMedicationName(),
                auth.getName(),
                "ROLE_DOCTOR"
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createPrescription(@RequestBody Prescription prescription, 
                                                 @RequestParam(value = "overrideWarning", defaultValue = "false") boolean overrideWarning,
                                                 Authentication auth) {
        if (prescription.getPatient() == null || prescription.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required for prescription creation");
        }

        User doctor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Prescribing doctor user not found"));
        Patient patient = patientRepository.findById(prescription.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + prescription.getPatient().getId() + " not found"));

        // Smart Allergy Safety Engine Contraindication Check
        SafetyCheckResult safetyResult = safetyService.checkPrescriptionSafety(
                patient.getId(), 
                prescription.getMedicationName(), 
                auth.getName(), 
                "ROLE_DOCTOR"
        );

        if (!safetyResult.isSafe() && !overrideWarning) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "CONTRAINDICATION_ALERT",
                    "safetyCheck", safetyResult,
                    "message", safetyResult.getMessage()
            ));
        }

        prescription.setDoctor(doctor);
        prescription.setPatient(patient);

        Prescription saved = prescriptionRepository.save(prescription);
        
        String auditDetail = "Prescribed " + saved.getMedicationName() + " (" + saved.getDosage() + ") to patient ID: " + patient.getId();
        if (!safetyResult.isSafe() && overrideWarning) {
            auditDetail += " [CLINICIAN OVERRIDE OF ALLERGY WARNING: " + safetyResult.getConflictingAllergen() + "]";
        }

        auditService.logAction(auth, "CREATE", "PRESCRIPTION", String.valueOf(saved.getId()), auditDetail);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Prescription rx = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription with ID " + id + " not found"));

        rx.setStatus(status);
        Prescription saved = prescriptionRepository.save(rx);
        auditService.logAction(auth, "UPDATE", "PRESCRIPTION", String.valueOf(id), "Updated prescription ID: " + id + " status to " + status);

        return ResponseEntity.ok(saved);
    }
}
