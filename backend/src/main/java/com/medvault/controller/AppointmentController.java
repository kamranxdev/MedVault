package com.medvault.controller;

import com.medvault.dto.DoctorRecommendationDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.*;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.service.AppointmentWorkflowService;
import com.medvault.service.AuditService;
import com.medvault.service.DoctorMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final DoctorMatchingService doctorMatchingService;
    private final AppointmentWorkflowService workflowService;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditService auditService,
                                  DoctorMatchingService doctorMatchingService,
                                  AppointmentWorkflowService workflowService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.doctorMatchingService = doctorMatchingService;
        this.workflowService = workflowService;
    }

    @GetMapping("/recommended-doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<DoctorRecommendationDTO> getRecommendedDoctors(@RequestParam(value = "patientId", required = false) Long patientId,
                                                                @RequestParam(value = "reason", required = false) String reason,
                                                                Authentication auth) {
        auditService.logAction(auth, "READ", "DOCTOR_MATCHING", patientId != null ? String.valueOf(patientId) : null, "Queried AI doctor recommendation matching engine for reason: " + reason);
        return doctorMatchingService.recommendDoctorsForPatient(patientId, reason);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<Appointment> getAllAppointments(Authentication auth) {
        boolean isPatientOnly = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_PATIENT")) &&
                auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_DOCTOR") || r.equals("ROLE_NURSE") || r.equals("ROLE_RECEPTIONIST") || r.equals("ROLE_AUDITOR"));

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

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id, Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + id + " not found"));
        return ResponseEntity.ok(apt);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "APPOINTMENT", String.valueOf(patientId), "Accessed appointment history for patient ID: " + patientId);
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_CREATE')")
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
        if (appointment.getStage() == null) {
            appointment.setStage("SCHEDULED");
        }

        Appointment saved = appointmentRepository.save(appointment);
        auditService.logAction(auth, "CREATE", "APPOINTMENT", String.valueOf(saved.getId()), "Scheduled appointment for patient ID: " + patient.getId() + " on " + saved.getAppointmentDate());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));

        apt.setStatus(status);
        apt.setStage(status);
        Appointment saved = appointmentRepository.save(apt);
        auditService.logAction(auth, "UPDATE", "APPOINTMENT", String.valueOf(id), "Changed appointment ID: " + id + " status to " + status);

        return ResponseEntity.ok(saved);
    }

    // --- WORKFLOW ENDPOINTS ---

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> checkInPatient(@PathVariable Long id,
                                                        @RequestBody Map<String, Object> payload,
                                                        Authentication auth) {
        Boolean insuranceVerified = (Boolean) payload.get("insuranceVerified");
        String insuranceDetails = (String) payload.get("insuranceDetails");
        String reportsUploaded = (String) payload.get("reportsUploaded");
        String note = (String) payload.get("note");

        Appointment checkedIn = workflowService.checkInPatient(id, insuranceVerified, insuranceDetails, reportsUploaded, note, auth);
        return ResponseEntity.ok(checkedIn);
    }

    @PostMapping("/{id}/triage-vitals")
    @PreAuthorize("hasAuthority('VITALS_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> recordTriageVitals(@PathVariable Long id,
                                                           @RequestBody Map<String, Object> payload,
                                                           Authentication auth) {
        Vitals vitals = new Vitals();
        if (payload.get("bloodPressure") != null) vitals.setBloodPressure((String) payload.get("bloodPressure"));
        if (payload.get("heartRate") != null) vitals.setHeartRate(Integer.parseInt(payload.get("heartRate").toString()));
        if (payload.get("temperature") != null) vitals.setTemperature(Double.parseDouble(payload.get("temperature").toString()));
        if (payload.get("oxygenSaturation") != null) vitals.setOxygenSaturation(Integer.parseInt(payload.get("oxygenSaturation").toString()));
        if (payload.get("respiratoryRate") != null) vitals.setRespiratoryRate(Integer.parseInt(payload.get("respiratoryRate").toString()));
        if (payload.get("weightKg") != null) vitals.setWeightKg(Double.parseDouble(payload.get("weightKg").toString()));
        if (payload.get("heightCm") != null) vitals.setHeightCm(Double.parseDouble(payload.get("heightCm").toString()));
        if (payload.get("bloodGlucose") != null) vitals.setBloodGlucose(Integer.parseInt(payload.get("bloodGlucose").toString()));

        String nursingNotes = (String) payload.get("nursingNotes");

        Appointment triaged = workflowService.recordTriageVitals(id, vitals, nursingNotes, auth);
        return ResponseEntity.ok(triaged);
    }

    @PostMapping("/{id}/doctor-consultation")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> recordDoctorConsultation(@PathVariable Long id,
                                                                 @RequestBody Map<String, Object> payload,
                                                                 Authentication auth) {
        String doctorNotes = (String) payload.get("doctorNotes");
        String followUpStr = (String) payload.get("followUpDate");
        LocalDateTime followUpDate = null;
        if (followUpStr != null && !followUpStr.isEmpty()) {
            followUpDate = LocalDateTime.parse(followUpStr);
        }

        // We accept optional lists of diagnoses, prescriptions, lab orders
        List<Diagnosis> diagnoses = new ArrayList<>();
        if (payload.get("diagnoses") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    Diagnosis d = new Diagnosis();
                    if (m.get("conditionName") != null) d.setConditionName(m.get("conditionName").toString());
                    if (m.get("icdCode") != null) d.setIcdCode(m.get("icdCode").toString());
                    if (m.get("snomedCode") != null) d.setSnomedCode(m.get("snomedCode").toString());
                    if (m.get("notes") != null) d.setNotes(m.get("notes").toString());
                    diagnoses.add(d);
                }
            }
        }

        List<Prescription> prescriptions = new ArrayList<>();
        if (payload.get("prescriptions") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    Prescription p = new Prescription();
                    if (m.get("medicationName") != null) p.setMedicationName(m.get("medicationName").toString());
                    if (m.get("rxNormCode") != null) p.setRxNormCode(m.get("rxNormCode").toString());
                    if (m.get("dosage") != null) p.setDosage(m.get("dosage").toString());
                    if (m.get("frequency") != null) p.setFrequency(m.get("frequency").toString());
                    if (m.get("durationDays") != null) p.setDurationDays(Integer.parseInt(m.get("durationDays").toString()));
                    if (m.get("instructions") != null) p.setInstructions(m.get("instructions").toString());
                    prescriptions.add(p);
                }
            }
        }

        List<AppointmentLabOrder> labOrders = new ArrayList<>();
        if (payload.get("labOrders") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    AppointmentLabOrder lo = new AppointmentLabOrder();
                    if (m.get("testName") != null) lo.setTestName(m.get("testName").toString());
                    if (m.get("priority") != null) lo.setPriority(m.get("priority").toString());
                    if (m.get("clinicalIndications") != null) lo.setClinicalIndications(m.get("clinicalIndications").toString());
                    labOrders.add(lo);
                }
            }
        }

        Appointment updated = workflowService.recordDoctorConsultation(id, diagnoses, prescriptions, labOrders, doctorNotes, followUpDate, auth);
        return ResponseEntity.ok(updated);
    }

    // --- NOTES ENDPOINTS ---

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentNote> getNotesForAppointment(@PathVariable Long id) {
        return workflowService.getNotesForAppointment(id);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentNote> addNote(@PathVariable Long id,
                                                    @RequestBody Map<String, String> payload,
                                                    Authentication auth) {
        String noteType = payload.get("noteType");
        String content = payload.get("content");
        AppointmentNote note = workflowService.addAppointmentNote(id, noteType, content, auth);
        return ResponseEntity.ok(note);
    }

    @PutMapping("/notes/{noteId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public ResponseEntity<AppointmentNote> editNote(@PathVariable Long noteId,
                                                     @RequestBody Map<String, String> payload,
                                                     Authentication auth) {
        String content = payload.get("content");
        AppointmentNote updated = workflowService.editAppointmentNote(noteId, content, auth);
        return ResponseEntity.ok(updated);
    }

    // --- CANCELLATION MODAL ENDPOINT ---

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('APPOINTMENT_CANCEL') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentCancellation> cancelAppointment(@PathVariable Long id,
                                                                      @RequestBody Map<String, String> payload,
                                                                      Authentication auth) {
        String reason = payload.get("reason");
        String comment = payload.get("comment");
        AppointmentCancellation cancellation = workflowService.cancelAppointment(id, reason, comment, auth);
        return ResponseEntity.ok(cancellation);
    }

    @GetMapping("/{id}/cancellation")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<?> getCancellationDetails(@PathVariable Long id) {
        Optional<AppointmentCancellation> opt = workflowService.getCancellationForAppointment(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.notFound().build();
    }

    // --- BILLING & LAB ORDERS ---

    @PostMapping("/{id}/billing")
    @PreAuthorize("hasAuthority('INVOICE_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentBilling> generateBilling(@PathVariable Long id,
                                                               @RequestBody Map<String, Object> payload,
                                                               Authentication auth) {
        Double consultationFee = payload.get("consultationFee") != null ? Double.parseDouble(payload.get("consultationFee").toString()) : 100.0;
        Double triageFee = payload.get("triageFee") != null ? Double.parseDouble(payload.get("triageFee").toString()) : 25.0;
        Double labFee = payload.get("labFee") != null ? Double.parseDouble(payload.get("labFee").toString()) : 0.0;
        Double pharmacyFee = payload.get("pharmacyFee") != null ? Double.parseDouble(payload.get("pharmacyFee").toString()) : 0.0;
        Double insuranceCoverage = payload.get("insuranceCoverage") != null ? Double.parseDouble(payload.get("insuranceCoverage").toString()) : 0.0;

        AppointmentBilling billing = workflowService.generateBilling(id, consultationFee, triageFee, labFee, pharmacyFee, insuranceCoverage, auth);
        return ResponseEntity.ok(billing);
    }

    @GetMapping("/{id}/billing")
    @PreAuthorize("hasAuthority('INVOICE_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<?> getBilling(@PathVariable Long id) {
        Optional<AppointmentBilling> opt = workflowService.getBillingForAppointment(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/lab-orders")
    @PreAuthorize("hasAuthority('LAB_RESULT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentLabOrder> getLabOrders(@PathVariable Long id) {
        return workflowService.getLabOrdersForAppointment(id);
    }
}
