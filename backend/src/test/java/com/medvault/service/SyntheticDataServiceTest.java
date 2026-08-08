package com.medvault.service;

import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class SyntheticDataServiceTest {

    private PatientRepository patientRepository;
    private EncounterRepository encounterRepository;
    private AllergyRepository allergyRepository;
    private DiagnosisRepository diagnosisRepository;
    private VitalsRepository vitalsRepository;
    private PrescriptionRepository prescriptionRepository;
    private UserRepository userRepository;
    private AuditLogRepository auditLogRepository;

    private SyntheticDataService syntheticDataService;

    @BeforeEach
    public void setUp() {
        patientRepository = mock(PatientRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        userRepository = mock(UserRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);

        syntheticDataService = new SyntheticDataService(
                patientRepository, encounterRepository, allergyRepository,
                diagnosisRepository, vitalsRepository, prescriptionRepository,
                userRepository, auditLogRepository
        );

        User mockDoctor = new User();
        mockDoctor.setUsername("doctor");
        User mockNurse = new User();
        mockNurse.setUsername("nurse");

        when(userRepository.findByUsername("doctor")).thenReturn(Optional.of(mockDoctor));
        when(userRepository.findByUsername("nurse")).thenReturn(Optional.of(mockNurse));

        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> {
            Patient p = i.getArgument(0);
            p.setId(101L);
            return p;
        });
    }

    @Test
    public void testGenerateCohort_Success() {
        List<Patient> cohort = syntheticDataService.generateCohort(2, "admin");

        assertNotNull(cohort);
        assertEquals(2, cohort.size());
        verify(patientRepository, times(2)).save(any(Patient.class));
        assertNotNull(cohort.get(0).getFullName());
        assertTrue(cohort.get(0).getPatientCode().startsWith("SYN-PAT-"));
    }
}
