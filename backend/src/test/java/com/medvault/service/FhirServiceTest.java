package com.medvault.service;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FhirServiceTest {

    private PatientRepository patientRepository;
    private EncounterRepository encounterRepository;
    private AllergyRepository allergyRepository;
    private DiagnosisRepository diagnosisRepository;
    private PrescriptionRepository prescriptionRepository;
    private VitalsRepository vitalsRepository;
    private UserRepository userRepository;

    private FhirService fhirService;

    @BeforeEach
    public void setUp() {
        patientRepository = mock(PatientRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        userRepository = mock(UserRepository.class);

        fhirService = new FhirService(patientRepository, encounterRepository, allergyRepository,
                diagnosisRepository, prescriptionRepository, vitalsRepository, userRepository);
    }

    @Test
    public void testGetCapabilityStatement() {
        Map<String, Object> cs = fhirService.getCapabilityStatement();
        assertNotNull(cs);
        assertEquals("CapabilityStatement", cs.get("resourceType"));
        assertEquals("4.0.1", cs.get("fhirVersion"));
    }

    @Test
    public void testToPatientResource() {
        Patient p = new Patient();
        p.setId(1L);
        p.setPatientCode("PAT-1001");
        p.setFullName("Jane Doe");
        p.setGender("Female");
        p.setDateOfBirth(LocalDate.of(1990, 5, 20));
        p.setPhone("+15550001111");
        p.setEmail("jane.doe@medvault.org");

        Map<String, Object> resource = fhirService.toPatientResource(p);

        assertNotNull(resource);
        assertEquals("Patient", resource.get("resourceType"));
        assertEquals("1", resource.get("id"));
        assertEquals("female", resource.get("gender"));
    }

    @Test
    public void testToEncounterResource() {
        Encounter enc = new Encounter();
        enc.setId(10L);
        enc.setStatus("COMPLETED");
        enc.setEncounterType("AMBULATORY");
        enc.setEncounterDate(LocalDateTime.now());

        Map<String, Object> resource = fhirService.toEncounterResource(enc);

        assertNotNull(resource);
        assertEquals("Encounter", resource.get("resourceType"));
        assertEquals("10", resource.get("id"));
    }

    @Test
    public void testToAllergyResource() {
        Allergy allergy = new Allergy();
        allergy.setId(5L);
        allergy.setAllergenName("Penicillin");
        allergy.setSeverity("HIGH");

        Map<String, Object> resource = fhirService.toAllergyResource(allergy);

        assertNotNull(resource);
        assertEquals("AllergyIntolerance", resource.get("resourceType"));
        assertEquals("5", resource.get("id"));
    }

    @Test
    public void testToConditionResource() {
        Diagnosis diag = new Diagnosis();
        diag.setId(15L);
        diag.setConditionName("Type 2 Diabetes");
        diag.setIcdCode("E11.9");

        Map<String, Object> resource = fhirService.toConditionResource(diag);

        assertNotNull(resource);
        assertEquals("Condition", resource.get("resourceType"));
        assertEquals("15", resource.get("id"));
    }

    @Test
    public void testToMedicationRequestResource() {
        Prescription rx = new Prescription();
        rx.setId(20L);
        rx.setMedicationName("Metformin");
        rx.setDosage("500mg");
        rx.setStatus("ACTIVE");

        Map<String, Object> resource = fhirService.toMedicationRequestResource(rx);

        assertNotNull(resource);
        assertEquals("MedicationRequest", resource.get("resourceType"));
        assertEquals("20", resource.get("id"));
    }

    @Test
    public void testToObservationResource() {
        Vitals vitals = new Vitals();
        vitals.setId(30L);
        vitals.setBloodPressure("120/80");
        vitals.setHeartRate(75);

        Map<String, Object> resource = fhirService.toObservationResource(vitals);

        assertNotNull(resource);
        assertEquals("Observation", resource.get("resourceType"));
        assertEquals("30", resource.get("id"));
    }

    @Test
    public void testBuildBundle() {
        Map<String, Object> p1 = Map.of("resourceType", "Patient", "id", "1");
        Map<String, Object> bundle = fhirService.buildBundle("Patient", List.of(p1));

        assertNotNull(bundle);
        assertEquals("Bundle", bundle.get("resourceType"));
        assertEquals("searchset", bundle.get("type"));
        assertEquals(1, bundle.get("total"));
    }

    @Test
    public void testGetPatientEverythingBundle_NotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        Map<String, Object> outcome = fhirService.getPatientEverythingBundle(999L);

        assertNotNull(outcome);
        assertEquals("OperationOutcome", outcome.get("resourceType"));
    }
}
