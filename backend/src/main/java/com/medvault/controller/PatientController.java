package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.Patient;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final AuditLogRepository auditLogRepository;

    public PatientController(PatientRepository patientRepository, AuditLogRepository auditLogRepository) {
        this.patientRepository = patientRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR')")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR')")
    public List<Patient> searchPatients(@RequestParam("query") String query, Authentication auth) {
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "READ",
                "PATIENT_MPI",
                "Executed Master Patient Index (MPI) search for query: '" + query + "'"
        ));
        return patientRepository.searchPatients(query);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR', 'PATIENT')")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id, Authentication auth) {
        return patientRepository.findById(id)
                .map(patient -> {
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            auth.getAuthorities().toString(),
                            "READ",
                            "PATIENT",
                            String.valueOf(id),
                            "Accessed patient demographic profile ID: " + id + " (" + patient.getFullName() + ")"
                    ));
                    return ResponseEntity.ok(patient);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'AUDITOR', 'PATIENT')")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId) {
        return patientRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, Authentication auth) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isEmpty()) {
            patient.setPatientCode("PAT-" + (1000 + (System.currentTimeMillis() % 9000)));
        }

        Patient saved = patientRepository.save(patient);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "CREATE",
                "PATIENT",
                String.valueOf(saved.getId()),
                "Created demographic identity profile for " + saved.getFullName() + " (MRN: " + saved.getPatientCode() + ")"
        ));

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient updated, Authentication auth) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patient.setFullName(updated.getFullName());
                    if (updated.getSsn() != null) patient.setSsn(updated.getSsn());
                    patient.setDateOfBirth(updated.getDateOfBirth());
                    patient.setGender(updated.getGender());
                    patient.setPhone(updated.getPhone());
                    patient.setEmail(updated.getEmail());
                    patient.setAddress(updated.getAddress());
                    patient.setEmergencyContact(updated.getEmergencyContact());
                    patient.setMedicalAlerts(updated.getMedicalAlerts());
                    patient.setBloodType(updated.getBloodType());
                    
                    if (updated.getInsuranceProvider() != null) patient.setInsuranceProvider(updated.getInsuranceProvider());
                    if (updated.getInsurancePolicyNumber() != null) patient.setInsurancePolicyNumber(updated.getInsurancePolicyNumber());
                    if (updated.getInsuranceGroupNumber() != null) patient.setInsuranceGroupNumber(updated.getInsuranceGroupNumber());
                    if (updated.getCoveragePlan() != null) patient.setCoveragePlan(updated.getCoveragePlan());

                    Patient saved = patientRepository.save(patient);
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            auth.getAuthorities().toString(),
                            "UPDATE",
                            "PATIENT",
                            String.valueOf(id),
                            "Updated demographic & insurance details for patient ID: " + id
                    ));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
