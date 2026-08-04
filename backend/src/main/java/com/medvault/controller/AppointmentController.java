package com.medvault.controller;

import com.medvault.dto.DoctorRecommendationDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Appointment;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AuditService;
import com.medvault.service.DoctorMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final DoctorMatchingService doctorMatchingService;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditService auditService,
                                  DoctorMatchingService doctorMatchingService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.doctorMatchingService = doctorMatchingService;
    }

    @GetMapping("/recommended-doctors")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT')")
    public List<DoctorRecommendationDTO> getRecommendedDoctors(@RequestParam(value = "patientId", required = false) Long patientId,
                                                                @RequestParam(value = "reason", required = false) String reason,
                                                                Authentication auth) {
        auditService.logAction(auth, "READ", "DOCTOR_MATCHING", patientId != null ? String.valueOf(patientId) : null, "Queried AI doctor recommendation matching engine for reason: " + reason);
        return doctorMatchingService.recommendDoctorsForPatient(patientId, reason);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT', 'AUDITOR')")
    public List<Appointment> getAllAppointments(Authentication auth) {
        boolean isPatientOnly = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_PATIENT")) &&
                auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_DOCTOR") || r.equals("ROLE_NURSE") || r.equals("ROLE_AUDITOR"));

        if (isPatientOnly) {
            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isPresent()) {
                Optional<Patient> patientOpt = patientRepository.findByUserId(userOpt.get().getId());
                if (patientOpt.isPresent()) {
                    return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientOpt.get().getId());
                }
            }
            return Collections.emptyList();
        }

        return appointmentRepository.findAll();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #patientId)")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "APPOINTMENT", String.valueOf(patientId), "Accessed appointment history for patient ID: " + patientId);
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    public ResponseEntity<?> scheduleAppointment(@RequestBody Appointment appointment, Authentication auth) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID must be provided");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            throw new IllegalArgumentException("Doctor ID must be provided");
        }

        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + appointment.getPatient().getId() + " not found"));
        User doctor = userRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + appointment.getDoctor().getId() + " not found"));

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        Appointment saved = appointmentRepository.save(appointment);
        auditService.logAction(auth, "CREATE", "APPOINTMENT", String.valueOf(saved.getId()), "Scheduled appointment for patient ID: " + patient.getId() + " on " + saved.getAppointmentDate());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));

        apt.setStatus(status);
        Appointment saved = appointmentRepository.save(apt);
        auditService.logAction(auth, "UPDATE", "APPOINTMENT", String.valueOf(id), "Changed appointment ID: " + id + " status to " + status);

        return ResponseEntity.ok(saved);
    }
}
