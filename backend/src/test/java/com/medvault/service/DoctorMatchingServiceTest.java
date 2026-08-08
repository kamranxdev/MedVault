package com.medvault.service;

import com.medvault.dto.DoctorRecommendationDTO;
import com.medvault.model.Patient;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DoctorMatchingServiceTest {

    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private DiagnosisRepository diagnosisRepository;
    private AppointmentRepository appointmentRepository;

    private DoctorMatchingService matchingService;
    private User cardiologist;
    private User dermatologist;

    @BeforeEach
    public void setUp() {
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        appointmentRepository = mock(AppointmentRepository.class);

        matchingService = new DoctorMatchingService(userRepository, patientRepository, diagnosisRepository, appointmentRepository);

        Role doctorRole = new Role();
        doctorRole.setName("ROLE_DOCTOR");

        cardiologist = new User();
        cardiologist.setId(1L);
        cardiologist.setFullName("Dr. Heart Specialist");
        cardiologist.setSpecialization("Cardiology");
        cardiologist.setYearsOfExperience(15);
        cardiologist.setRoles(Set.of(doctorRole));

        dermatologist = new User();
        dermatologist.setId(2L);
        dermatologist.setFullName("Dr. Skin Specialist");
        dermatologist.setSpecialization("Dermatology");
        dermatologist.setYearsOfExperience(10);
        dermatologist.setRoles(Set.of(doctorRole));

        when(userRepository.findAll()).thenReturn(List.of(cardiologist, dermatologist));
    }

    @Test
    public void testRecommendDoctors_CardiologyReasonMatchesCardiologist() {
        List<DoctorRecommendationDTO> recs = matchingService.recommendDoctorsForPatient(null, "Experiencing chest pain and severe palpitations");

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertEquals("Dr. Heart Specialist", recs.get(0).getDoctor().getFullName());
        assertEquals("Cardiology", recs.get(0).getDoctor().getSpecialization());
        assertTrue(recs.get(0).getMatchScore() > 50);
    }

    @Test
    public void testRecommendDoctors_DermatologyReasonMatchesDermatologist() {
        List<DoctorRecommendationDTO> recs = matchingService.recommendDoctorsForPatient(null, "Skin rash and eczema flare-up");

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertEquals("Dr. Skin Specialist", recs.get(0).getDoctor().getFullName());
        assertEquals("Dermatology", recs.get(0).getDoctor().getSpecialization());
    }

    @Test
    public void testRecommendDoctors_NullReasonReturnsAllDoctorsWithDefaultScore() {
        List<DoctorRecommendationDTO> recs = matchingService.recommendDoctorsForPatient(null, null);

        assertNotNull(recs);
        assertEquals(2, recs.size());
    }

    @Test
    public void testRecommendDoctors_WithPatientHistory() {
        Patient patient = new Patient();
        patient.setId(5L);
        patient.setPastMedicalHistory("Prior history of Angina");

        when(patientRepository.findById(5L)).thenReturn(Optional.of(patient));

        List<DoctorRecommendationDTO> recs = matchingService.recommendDoctorsForPatient(5L, "Regular checkup");

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        // History of Angina should boost Cardiology match score
        assertEquals("Cardiology", recs.get(0).getDoctor().getSpecialization());
    }
}
