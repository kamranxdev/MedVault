package com.medvault;

import com.medvault.controller.FhirController;
import com.medvault.model.Patient;
import com.medvault.repository.*;
import com.medvault.service.FhirService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class FhirControllerTest {

    private PatientRepository patientRepository;
    private EncounterRepository encounterRepository;
    private AllergyRepository allergyRepository;
    private DiagnosisRepository diagnosisRepository;
    private PrescriptionRepository prescriptionRepository;
    private VitalsRepository vitalsRepository;
    private UserRepository userRepository;

    private FhirService fhirService;
    private FhirController fhirController;

    @BeforeEach
    public void setup() {
        patientRepository = mock(PatientRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        userRepository = mock(UserRepository.class);

        fhirService = new FhirService(patientRepository, encounterRepository, allergyRepository,
                diagnosisRepository, prescriptionRepository, vitalsRepository, userRepository);

        fhirController = new FhirController(fhirService, patientRepository, encounterRepository,
                allergyRepository, diagnosisRepository, prescriptionRepository, vitalsRepository);
    }

    @Test
    public void testGetMetadata_CapabilityStatement() {
        ResponseEntity<Map<String, Object>> response = fhirController.getMetadata();
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("CapabilityStatement", response.getBody().get("resourceType"));
        assertEquals("4.0.1", response.getBody().get("fhirVersion"));
    }

    @Test
    public void testSearchPatients() {
        Patient p = new Patient();
        p.setId(1L);
        p.setPatientCode("MRN-1001");
        p.setFullName("John Doe");
        p.setGender("male");
        p.setDateOfBirth(LocalDate.of(1985, 5, 20));

        when(patientRepository.findAll()).thenReturn(List.of(p));

        ResponseEntity<Map<String, Object>> response = fhirController.searchPatients(null, null, null);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> bundle = response.getBody();
        assertNotNull(bundle);
        assertEquals("Bundle", bundle.get("resourceType"));
        assertEquals(1, bundle.get("total"));
    }

    @Test
    public void testGetPatientById_Found() {
        Patient p = new Patient();
        p.setId(1L);
        p.setPatientCode("MRN-1001");
        p.setFullName("Jane Smith");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(p));

        ResponseEntity<Map<String, Object>> response = fhirController.getPatientById(1L);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Patient", response.getBody().get("resourceType"));
        assertEquals("Jane Smith", ((List<Map<String, Object>>) response.getBody().get("name")).get(0).get("text"));
    }

    @Test
    public void testGetPatientById_NotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> response = fhirController.getPatientById(99L);
        assertEquals(404, response.getStatusCode().value());
        assertEquals("OperationOutcome", response.getBody().get("resourceType"));
    }

    @Test
    public void testPatientEverythingBundle() {
        Patient p = new Patient();
        p.setId(1L);
        p.setFullName("Alex Mercer");
        p.setPatientCode("MRN-555");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(p));
        when(encounterRepository.findByPatientIdOrderByEncounterDateDesc(1L)).thenReturn(Collections.emptyList());
        when(allergyRepository.findByPatientIdOrderByRecordedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(vitalsRepository.findByPatientIdOrderByRecordedAtDesc(1L)).thenReturn(Collections.emptyList());

        ResponseEntity<Map<String, Object>> response = fhirController.getPatientEverything(1L);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> bundle = response.getBody();
        assertEquals("Bundle", bundle.get("resourceType"));
        assertEquals("collection", bundle.get("type"));
        assertEquals(1, bundle.get("total"));
    }
}
