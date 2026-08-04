package com.medvault.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.*;
import com.medvault.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AppointmentWorkflowService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentCancellationRepository cancellationRepository;
    private final AppointmentNoteRepository noteRepository;
    private final AppointmentLabOrderRepository labOrderRepository;
    private final AppointmentBillingRepository billingRepository;
    private final VitalsRepository vitalsRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;
    private final SmartSafetyService smartSafetyService;
    private final ObjectMapper objectMapper;

    public AppointmentWorkflowService(AppointmentRepository appointmentRepository,
                                     AppointmentCancellationRepository cancellationRepository,
                                     AppointmentNoteRepository noteRepository,
                                     AppointmentLabOrderRepository labOrderRepository,
                                     AppointmentBillingRepository billingRepository,
                                     VitalsRepository vitalsRepository,
                                     DiagnosisRepository diagnosisRepository,
                                     PrescriptionRepository prescriptionRepository,
                                     UserRepository userRepository,
                                     PatientRepository patientRepository,
                                     AuditService auditService,
                                     SmartSafetyService smartSafetyService,
                                     ObjectMapper objectMapper) {
        this.appointmentRepository = appointmentRepository;
        this.cancellationRepository = cancellationRepository;
        this.noteRepository = noteRepository;
        this.labOrderRepository = labOrderRepository;
        this.billingRepository = billingRepository;
        this.vitalsRepository = vitalsRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
        this.smartSafetyService = smartSafetyService;
        this.objectMapper = objectMapper;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + auth.getName()));
    }

    private String determinePrimaryRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return "PATIENT";
        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        if (roles.contains("ROLE_ADMIN")) return "Admin";
        if (roles.contains("ROLE_RECEPTIONIST")) return "Receptionist";
        if (roles.contains("ROLE_DOCTOR")) return "Doctor";
        if (roles.contains("ROLE_NURSE")) return "Nurse";
        if (roles.contains("ROLE_PATIENT")) return "Patient";
        return "User";
    }

    @Transactional
    public Appointment checkInPatient(Long appointmentId, Boolean insuranceVerified, String insuranceDetails, String reportsUploaded, String note, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        apt.setStatus("CHECKED_IN");
        apt.setStage("CHECKED_IN");
        if (insuranceVerified != null) apt.setInsuranceVerified(insuranceVerified);
        if (insuranceDetails != null) apt.setInsuranceDetails(insuranceDetails);
        if (reportsUploaded != null) apt.setReportsUploaded(reportsUploaded);

        Appointment saved = appointmentRepository.save(apt);

        User user = getAuthenticatedUser(auth);
        String roleName = determinePrimaryRole(auth);

        if (note != null && !note.trim().isEmpty()) {
            addAppointmentNoteInternal(saved, user, roleName, "RECEPTIONIST_ADMIN", note);
        }

        auditService.logAction(auth, "UPDATE", "APPOINTMENT_CHECKIN", String.valueOf(appointmentId),
                "Patient " + apt.getPatient().getFullName() + " checked in by " + user.getFullName() + " (" + roleName + ")");

        return saved;
    }

    @Transactional
    public Appointment recordTriageVitals(Long appointmentId, Vitals vitalsInput, String nursingNotes, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        User user = getAuthenticatedUser(auth);
        vitalsInput.setPatient(apt.getPatient());
        vitalsInput.setRecordedBy(user);
        vitalsInput.setRecordedAt(LocalDateTime.now());

        // Calculate BMI if height and weight present
        if (vitalsInput.getHeightCm() != null && vitalsInput.getWeightKg() != null && vitalsInput.getHeightCm() > 0) {
            double heightM = vitalsInput.getHeightCm() / 100.0;
            double bmi = vitalsInput.getWeightKg() / (heightM * heightM);
            vitalsInput.setBmi(Math.round(bmi * 10.0) / 10.0);
        }

        Vitals savedVitals = vitalsRepository.save(vitalsInput);

        apt.setVitals(savedVitals);
        apt.setStage("TRIAGED");
        apt.setStatus("TRIAGED");
        Appointment savedApt = appointmentRepository.save(apt);

        String roleName = determinePrimaryRole(auth);
        if (nursingNotes != null && !nursingNotes.trim().isEmpty()) {
            addAppointmentNoteInternal(savedApt, user, roleName, "NURSE_OBSERVATION", nursingNotes);
        }

        auditService.logAction(auth, "CREATE", "VITALS_TRIAGE", String.valueOf(savedVitals.getId()),
                "Vitals & triage recorded for appointment #" + appointmentId + " by Nurse " + user.getFullName());

        return savedApt;
    }

    @Transactional
    public Appointment recordDoctorConsultation(Long appointmentId,
                                                List<Diagnosis> diagnoses,
                                                List<Prescription> prescriptions,
                                                List<AppointmentLabOrder> labOrders,
                                                String doctorNotes,
                                                LocalDateTime followUpDate,
                                                Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        User doctor = getAuthenticatedUser(auth);

        // Save Diagnoses
        if (diagnoses != null) {
            for (Diagnosis d : diagnoses) {
                d.setPatient(apt.getPatient());
                d.setDoctor(doctor);
                if (d.getRecordedAt() == null) d.setRecordedAt(LocalDateTime.now());
                diagnosisRepository.save(d);
            }
        }

        // Save Prescriptions with Allergy Check
        if (prescriptions != null) {
            for (Prescription p : prescriptions) {
                p.setPatient(apt.getPatient());
                p.setDoctor(doctor);
                if (p.getPrescribedAt() == null) p.setPrescribedAt(LocalDateTime.now());
                
                // Smart Safety check
                smartSafetyService.checkPrescriptionSafety(apt.getPatient().getId(), p.getMedicationName(), doctor.getUsername(), "ROLE_DOCTOR");
                
                prescriptionRepository.save(p);
            }
        }

        // Save Lab Orders
        if (labOrders != null) {
            for (AppointmentLabOrder lo : labOrders) {
                lo.setAppointment(apt);
                lo.setOrderedBy(doctor);
                lo.setOrderedAt(LocalDateTime.now());
                labOrderRepository.save(lo);
            }
        }

        if (followUpDate != null) {
            apt.setFollowUpDate(followUpDate);
        }

        apt.setStage("IN_CONSULTATION");
        apt.setStatus("IN_CONSULTATION");
        Appointment savedApt = appointmentRepository.save(apt);

        String roleName = determinePrimaryRole(auth);
        if (doctorNotes != null && !doctorNotes.trim().isEmpty()) {
            addAppointmentNoteInternal(savedApt, doctor, roleName, "DOCTOR_CLINICAL", doctorNotes);
        }

        auditService.logAction(auth, "UPDATE", "DOCTOR_CONSULTATION", String.valueOf(appointmentId),
                "Doctor consultation recorded for appointment #" + appointmentId + " by " + doctor.getFullName());

        return savedApt;
    }

    @Transactional
    public AppointmentNote addAppointmentNote(Long appointmentId, String noteType, String content, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        User user = getAuthenticatedUser(auth);
        String roleName = determinePrimaryRole(auth);

        AppointmentNote note = addAppointmentNoteInternal(apt, user, roleName, noteType, content);

        auditService.logAction(auth, "CREATE", "APPOINTMENT_NOTE", String.valueOf(note.getId()),
                "Added " + noteType + " note to appointment #" + appointmentId + " by " + user.getFullName() + " (" + roleName + ")");

        return note;
    }

    private AppointmentNote addAppointmentNoteInternal(Appointment apt, User user, String roleName, String noteType, String content) {
        AppointmentNote note = new AppointmentNote();
        note.setAppointment(apt);
        note.setAuthor(user);
        note.setAuthorName(user.getFullName());
        note.setAuthorRole(roleName);
        note.setNoteType(noteType != null ? noteType : "GENERAL");
        note.setContent(content);
        note.setCreatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    @Transactional
    public AppointmentNote editAppointmentNote(Long noteId, String newContent, Authentication auth) {
        AppointmentNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note #" + noteId + " not found"));

        User user = getAuthenticatedUser(auth);
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!note.getAuthor().getId().equals(user.getId()) && !isAdmin) {
            throw new IllegalStateException("Only the creator of the note or an Admin can edit this note.");
        }

        // Record history
        List<Map<String, Object>> history = new ArrayList<>();
        if (note.getEditHistoryJson() != null && !note.getEditHistoryJson().isEmpty()) {
            try {
                history = objectMapper.readValue(note.getEditHistoryJson(), new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                history = new ArrayList<>();
            }
        }

        Map<String, Object> entry = new HashMap<>();
        entry.put("previousContent", note.getContent());
        entry.put("editedBy", user.getFullName());
        entry.put("editedAt", LocalDateTime.now().toString());
        history.add(entry);

        try {
            note.setEditHistoryJson(objectMapper.writeValueAsString(history));
        } catch (Exception e) {
            note.setEditHistoryJson(null);
        }

        note.setContent(newContent);
        note.setEdited(true);
        note.setUpdatedAt(LocalDateTime.now());

        AppointmentNote updated = noteRepository.save(note);

        auditService.logAction(auth, "UPDATE", "APPOINTMENT_NOTE", String.valueOf(noteId),
                "Edited note #" + noteId + " for appointment #" + note.getAppointment().getId() + " by " + user.getFullName());

        return updated;
    }

    @Transactional
    public AppointmentCancellation cancelAppointment(Long appointmentId, String reason, String comment, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        User user = getAuthenticatedUser(auth);
        String roleName = determinePrimaryRole(auth);

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason must be selected");
        }

        if ("Other".equalsIgnoreCase(reason.trim()) && (comment == null || comment.trim().isEmpty())) {
            throw new IllegalArgumentException("Additional Comments are mandatory when 'Other' is selected as the cancellation reason.");
        }

        apt.setStatus("CANCELLED");
        apt.setStage("CANCELLED");
        appointmentRepository.save(apt);

        AppointmentCancellation cancellation = new AppointmentCancellation(
                apt,
                user,
                roleName,
                reason,
                comment,
                "NOT_APPLICABLE"
        );

        AppointmentCancellation savedCancellation = cancellationRepository.save(cancellation);

        String timestampStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a"));
        String auditDetails = String.format("Appointment #AP-%d Status: Cancelled | Cancelled By: %s (%s) | Reason: %s | Comment: %s | Cancelled At: %s",
                appointmentId, user.getFullName(), roleName, reason, comment != null ? comment : "N/A", timestampStr);

        auditService.logAction(auth, "CANCEL", "APPOINTMENT", String.valueOf(appointmentId), auditDetails);

        return savedCancellation;
    }

    @Transactional
    public AppointmentBilling generateBilling(Long appointmentId, Double consultationFee, Double triageFee, Double labFee, Double pharmacyFee, Double insuranceCoverage, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        AppointmentBilling billing = billingRepository.findByAppointmentId(appointmentId)
                .orElse(new AppointmentBilling());

        billing.setAppointment(apt);
        billing.setConsultationFee(consultationFee != null ? consultationFee : 100.0);
        billing.setTriageFee(triageFee != null ? triageFee : 25.0);
        billing.setLabFee(labFee != null ? labFee : 0.0);
        billing.setPharmacyFee(pharmacyFee != null ? pharmacyFee : 0.0);
        billing.setInsuranceCoverage(insuranceCoverage != null ? insuranceCoverage : 0.0);

        double total = billing.getConsultationFee() + billing.getTriageFee() + billing.getLabFee() + billing.getPharmacyFee();
        double net = Math.max(0.0, total - billing.getInsuranceCoverage());
        billing.setNetPayable(net);
        billing.setGeneratedAt(LocalDateTime.now());
        billing.setPaymentStatus("PAID");

        AppointmentBilling saved = billingRepository.save(billing);

        apt.setStatus("COMPLETED");
        apt.setStage("COMPLETED");
        appointmentRepository.save(apt);

        auditService.logAction(auth, "CREATE", "APPOINTMENT_BILLING", String.valueOf(saved.getId()),
                "Generated bill of $" + net + " for appointment #" + appointmentId);

        return saved;
    }

    public List<AppointmentNote> getNotesForAppointment(Long appointmentId) {
        return noteRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId);
    }

    public List<AppointmentLabOrder> getLabOrdersForAppointment(Long appointmentId) {
        return labOrderRepository.findByAppointmentIdOrderByOrderedAtDesc(appointmentId);
    }

    public Optional<AppointmentCancellation> getCancellationForAppointment(Long appointmentId) {
        return cancellationRepository.findByAppointmentId(appointmentId);
    }

    public Optional<AppointmentBilling> getBillingForAppointment(Long appointmentId) {
        return billingRepository.findByAppointmentId(appointmentId);
    }
}
