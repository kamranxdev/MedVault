package com.medvault.security;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PatientSecurityServiceTest {

    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private AppointmentRepository appointmentRepository;
    private PrescriptionRepository prescriptionRepository;
    private EncounterRepository encounterRepository;
    private DiagnosisRepository diagnosisRepository;
    private AllergyRepository allergyRepository;
    private VitalsRepository vitalsRepository;
    private MedicalRecordRepository medicalRecordRepository;
    private AbacSecurityEvaluator abacEvaluator;

    private PatientSecurityService securityService;
    private Authentication doctorAuth;

    @BeforeEach
    public void setUp() {
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        appointmentRepository = mock(AppointmentRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        medicalRecordRepository = mock(MedicalRecordRepository.class);
        abacEvaluator = mock(AbacSecurityEvaluator.class);

        securityService = new PatientSecurityService(
                userRepository, patientRepository, appointmentRepository,
                prescriptionRepository, encounterRepository, diagnosisRepository,
                allergyRepository, vitalsRepository, medicalRecordRepository, abacEvaluator
        );

        doctorAuth = mock(Authentication.class);
        when(doctorAuth.isAuthenticated()).thenReturn(true);
        when(doctorAuth.getName()).thenReturn("doctor_mahtab");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(doctorAuth).getAuthorities();
    }

    @Test
    public void testCanAccessPatient_DelegatesToAbacEvaluator() {
        when(abacEvaluator.hasTreatmentRelationship(doctorAuth, 1L)).thenReturn(true);

        boolean allowed = securityService.canAccessPatient(doctorAuth, 1L);

        assertTrue(allowed);
        verify(abacEvaluator, times(1)).hasTreatmentRelationship(doctorAuth, 1L);
    }

    @Test
    public void testCanAccessAppointment_ValidAppointmentId() {
        Patient patient = new Patient();
        patient.setId(1L);

        Appointment apt = new Appointment();
        apt.setId(100L);
        apt.setPatient(patient);

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(apt));
        when(abacEvaluator.hasTreatmentRelationship(doctorAuth, 1L)).thenReturn(true);

        boolean allowed = securityService.canAccessAppointment(doctorAuth, 100L);

        assertTrue(allowed);
    }

    @Test
    public void testCanAccessAppointment_NullOrNotFoundReturnsFalse() {
        assertFalse(securityService.canAccessAppointment(doctorAuth, null));

        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());
        assertFalse(securityService.canAccessAppointment(doctorAuth, 999L));
    }

    @Test
    public void testCanAccessPrescription_ValidPrescriptionId() {
        Patient patient = new Patient();
        patient.setId(1L);

        Prescription rx = new Prescription();
        rx.setId(200L);
        rx.setPatient(patient);

        when(prescriptionRepository.findById(200L)).thenReturn(Optional.of(rx));
        when(abacEvaluator.hasTreatmentRelationship(doctorAuth, 1L)).thenReturn(true);

        boolean allowed = securityService.canAccessPrescription(doctorAuth, 200L);

        assertTrue(allowed);
    }

    @Test
    public void testCanAccessAllergy_ValidAllergyId() {
        Patient patient = new Patient();
        patient.setId(1L);

        Allergy allergy = new Allergy();
        allergy.setId(300L);
        allergy.setPatient(patient);

        when(allergyRepository.findById(300L)).thenReturn(Optional.of(allergy));
        when(abacEvaluator.hasTreatmentRelationship(doctorAuth, 1L)).thenReturn(true);

        boolean allowed = securityService.canAccessAllergy(doctorAuth, 300L);

        assertTrue(allowed);
    }

    @Test
    public void testCanAccessUser_AdminAllowed() {
        Authentication adminAuth = mock(Authentication.class);
        when(adminAuth.isAuthenticated()).thenReturn(true);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_SYS_ADMIN"))).when(adminAuth).getAuthorities();

        assertTrue(securityService.canAccessUser(adminAuth, 5L));
    }
}
