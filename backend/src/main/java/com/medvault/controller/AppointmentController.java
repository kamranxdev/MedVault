package com.medvault.controller;

import com.medvault.model.Appointment;
import com.medvault.model.AuditLog;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                 PatientRepository patientRepository,
                                 UserRepository userRepository,
                                 AuditLogRepository auditLogRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    public ResponseEntity<?> scheduleAppointment(@RequestBody Appointment appointment, Authentication auth) {
        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User doctor = userRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        Appointment saved = appointmentRepository.save(appointment);
        auditLogRepository.save(new AuditLog(
                auth.getName(),
                auth.getAuthorities().toString(),
                "CREATE",
                "APPOINTMENT",
                "Scheduled appointment for patient ID: " + patient.getId() + " on " + saved.getAppointmentDate()
        ));

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        return appointmentRepository.findById(id)
                .map(apt -> {
                    apt.setStatus(status);
                    Appointment saved = appointmentRepository.save(apt);
                    auditLogRepository.save(new AuditLog(
                            auth.getName(),
                            auth.getAuthorities().toString(),
                            "UPDATE",
                            "APPOINTMENT",
                            "Changed appointment ID: " + id + " status to " + status
                    ));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
