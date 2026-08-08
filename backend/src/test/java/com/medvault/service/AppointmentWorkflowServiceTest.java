package com.medvault.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.*;
import com.medvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class AppointmentWorkflowServiceTest {

    private AppointmentRepository appointmentRepository;
    private AppointmentCancellationRepository cancellationRepository;
    private AppointmentNoteRepository noteRepository;
    private AppointmentLabOrderRepository labOrderRepository;
    private AppointmentBillingRepository billingRepository;
    private VitalsRepository vitalsRepository;
    private DiagnosisRepository diagnosisRepository;
    private PrescriptionRepository prescriptionRepository;
    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private AuditService auditService;
    private SmartSafetyService smartSafetyService;
    private ObjectMapper objectMapper;

    private AppointmentWorkflowService workflowService;
    private Authentication authMock;
    private User testUser;
    private Patient testPatient;
    private Appointment testAppointment;

    @BeforeEach
    public void setUp() {
        appointmentRepository = mock(AppointmentRepository.class);
        cancellationRepository = mock(AppointmentCancellationRepository.class);
        noteRepository = mock(AppointmentNoteRepository.class);
        labOrderRepository = mock(AppointmentLabOrderRepository.class);
        billingRepository = mock(AppointmentBillingRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        auditService = mock(AuditService.class);
        smartSafetyService = mock(SmartSafetyService.class);
        objectMapper = new ObjectMapper();

        workflowService = new AppointmentWorkflowService(
                appointmentRepository, cancellationRepository, noteRepository,
                labOrderRepository, billingRepository, vitalsRepository,
                diagnosisRepository, prescriptionRepository, userRepository,
                patientRepository, auditService, smartSafetyService, objectMapper
        );

        authMock = mock(Authentication.class);
        when(authMock.getName()).thenReturn("doctor_test");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(authMock).getAuthorities();

        testUser = new User();
        testUser.setId(10L);
        testUser.setUsername("doctor_test");
        testUser.setFullName("Dr. Test Doctor");
        when(userRepository.findByUsername("doctor_test")).thenReturn(Optional.of(testUser));

        testPatient = new Patient();
        testPatient.setId(1L);
        testPatient.setFullName("Kamran Khan");

        testAppointment = new Appointment();
        testAppointment.setId(100L);
        testAppointment.setPatient(testPatient);
        testAppointment.setDoctor(testUser);
        testAppointment.setAppointmentDate(LocalDateTime.now());
        testAppointment.setStatus("SCHEDULED");
        testAppointment.setStage("SCHEDULED");

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    public void testCheckInPatient_Success() {
        Appointment checkedIn = workflowService.checkInPatient(100L, true, "Verified Plan A", "Reports attached", "Regular checkup", authMock);

        assertNotNull(checkedIn);
        assertEquals("CHECKED_IN", checkedIn.getStage());
        assertTrue(checkedIn.getInsuranceVerified());
        verify(noteRepository, times(1)).save(any(AppointmentNote.class));
    }

    @Test
    public void testCheckInPatient_NotFoundThrowsException() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
                workflowService.checkInPatient(999L, true, "Details", null, null, authMock)
        );
    }

    @Test
    public void testRecordTriageVitals_Success() {
        Vitals vitals = new Vitals();
        vitals.setBloodPressure("120/80");
        vitals.setHeartRate(72);
        vitals.setTemperature(98.6);

        when(vitalsRepository.save(any(Vitals.class))).thenAnswer(i -> {
            Vitals v = i.getArgument(0);
            v.setId(50L);
            return v;
        });

        Appointment triaged = workflowService.recordTriageVitals(100L, vitals, "Patient calm", authMock);

        assertNotNull(triaged);
        assertEquals("TRIAGED", triaged.getStage());
        verify(vitalsRepository, times(1)).save(any(Vitals.class));
    }

    @Test
    public void testRecordDoctorConsultation_Success() {
        Diagnosis diag = new Diagnosis();
        diag.setConditionName("Hypertension");
        diag.setIcdCode("I10");

        Prescription rx = new Prescription();
        rx.setMedicationName("Lisinopril");

        AppointmentLabOrder labOrder = new AppointmentLabOrder();
        labOrder.setTestName("Complete Blood Count");

        when(smartSafetyService.checkPrescriptionSafety(eq(1L), eq("Lisinopril"), eq("doctor_test"), anyString()))
                .thenReturn(new SmartSafetyService.SafetyCheckResult(true, "NONE", null, "Safe"));

        Appointment completed = workflowService.recordDoctorConsultation(
                100L, List.of(diag), List.of(rx), List.of(labOrder), "Patient in good condition", LocalDateTime.now().plusDays(14), authMock
        );

        assertNotNull(completed);
        assertEquals("IN_CONSULTATION", completed.getStage());
        verify(diagnosisRepository, times(1)).save(any(Diagnosis.class));
        verify(prescriptionRepository, times(1)).save(any(Prescription.class));
        verify(labOrderRepository, times(1)).save(any(AppointmentLabOrder.class));
    }

    @Test
    public void testCancelAppointment_Success() {
        when(cancellationRepository.save(any(AppointmentCancellation.class))).thenAnswer(i -> i.getArgument(0));

        AppointmentCancellation cancellation = workflowService.cancelAppointment(100L, "PATIENT_REQUEST", "Rescheduled", authMock);

        assertNotNull(cancellation);
        assertEquals("CANCELLED", testAppointment.getStatus());
        assertEquals("PATIENT_REQUEST", cancellation.getCancellationReason());
    }

    @Test
    public void testGenerateBilling_Success() {
        when(billingRepository.save(any(AppointmentBilling.class))).thenAnswer(i -> i.getArgument(0));

        AppointmentBilling billing = workflowService.generateBilling(100L, 150.0, 30.0, 50.0, 20.0, 100.0, authMock);

        assertNotNull(billing);
        assertEquals(150.0, billing.getNetPayable());
        assertEquals(100.0, billing.getInsuranceCoverage());
    }

    @Test
    public void testGetLabOrdersForAppointment() {
        AppointmentLabOrder order = new AppointmentLabOrder();
        order.setTestName("Lipid Panel");
        when(labOrderRepository.findByAppointmentIdOrderByOrderedAtDesc(100L)).thenReturn(List.of(order));

        List<AppointmentLabOrder> orders = workflowService.getLabOrdersForAppointment(100L);

        assertEquals(1, orders.size());
        assertEquals("Lipid Panel", orders.get(0).getTestName());
    }
}
