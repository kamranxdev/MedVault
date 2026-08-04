package com.medvault.service;

import com.medvault.model.Patient;
import com.medvault.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class SyntheaPipelineServiceTest {

    @Autowired
    private SyntheaPipelineService syntheaPipelineService;

    @Autowired
    private PatientRepository patientRepository;

    @Test
    public void testGetPipelineStatus() {
        Map<String, Object> status = syntheaPipelineService.getPipelineStatus();
        assertNotNull(status);
        assertTrue((Boolean) status.get("syntheaEngineReady"));
        assertNotNull(status.get("frameworkVersion"));
    }

    @Test
    public void testExecuteOfficialSyntheaPipeline() {
        long initialCount = patientRepository.count();
        Map<String, Object> result = syntheaPipelineService.executePipeline(1, "Massachusetts", "testadmin");
        
        assertNotNull(result);
        assertEquals("SUCCESS", result.get("status"));
        assertTrue((Integer) result.get("patientsIngested") >= 1);
        assertTrue(patientRepository.count() > initialCount);

        @SuppressWarnings("unchecked")
        List<Patient> patients = (List<Patient>) result.get("patients");
        assertNotNull(patients);
        assertFalse(patients.isEmpty());
        
        Patient first = patients.get(0);
        assertNotNull(first.getFullName());
        assertNotNull(first.getPatientCode());
    }

    @Test
    public void testParseAndSaveFhirBundle() {
        String sampleFhirBundle = """
        {
          "resourceType": "Bundle",
          "id": "test-synthea-bundle",
          "type": "collection",
          "entry": [
            {
              "resource": {
                "resourceType": "Patient",
                "id": "pat-12345",
                "identifier": [
                  { "system": "urn:oid:2.16.840.1.113883.4.1", "value": "SYN-PAT-998877" },
                  { "system": "urn:oid:2.16.840.1.113883.4.1.ssn", "value": "999-00-1234" }
                ],
                "name": [ { "family": "SyntheaTest", "given": ["Jane"] } ],
                "gender": "female",
                "birthDate": "1985-04-12",
                "address": [ { "line": ["42 Synthetic Lane"], "city": "Boston", "state": "MA" } ],
                "telecom": [ { "system": "phone", "value": "+1-555-888-9999" } ]
              }
            },
            {
              "resource": {
                "resourceType": "Encounter",
                "id": "enc-1",
                "status": "finished",
                "class": { "code": "AMB" },
                "reasonCode": [ { "text": "Synthea Annual Checkup" } ],
                "period": { "start": "2026-01-10T10:00:00Z" }
              }
            },
            {
              "resource": {
                "resourceType": "AllergyIntolerance",
                "id": "alg-1",
                "criticality": "high",
                "code": { "text": "Amoxicillin", "coding": [ { "code": "70618" } ] },
                "reaction": [ { "manifestation": [ { "text": "Anaphylaxis" } ] } ]
              }
            },
            {
              "resource": {
                "resourceType": "Condition",
                "id": "cond-1",
                "code": { "text": "Essential Hypertension", "coding": [ { "code": "I10" } ] },
                "onsetDateTime": "2015-06-01"
              }
            },
            {
              "resource": {
                "resourceType": "MedicationRequest",
                "id": "med-1",
                "status": "active",
                "medicationCodeableConcept": { "text": "Lisinopril 10 MG", "coding": [ { "code": "314076" } ] },
                "dosageInstruction": [ { "text": "Take 1 tablet daily" } ]
              }
            },
            {
              "resource": {
                "resourceType": "Observation",
                "id": "obs-1",
                "status": "final",
                "code": { "coding": [ { "code": "8480-6" } ] },
                "valueQuantity": { "value": 128.0, "unit": "mmHg" }
              }
            }
          ]
        }
        """;

        Map<String, Object> metrics = syntheaPipelineService.parseAndSaveFhirBundle(sampleFhirBundle, "testadmin");
        assertNotNull(metrics);
        assertEquals(1, metrics.get("patientsCount"));
        assertEquals(1, metrics.get("encountersCount"));
        assertEquals(1, metrics.get("allergiesCount"));
        assertEquals(1, metrics.get("conditionsCount"));
        assertEquals(1, metrics.get("prescriptionsCount"));
        assertEquals(1, metrics.get("vitalsCount"));

        Patient p = (Patient) metrics.get("patient");
        assertNotNull(p);
        assertEquals("Jane SyntheaTest", p.getFullName());
        assertEquals("SYN-PAT-998877", p.getPatientCode());
        assertEquals("999-00-1234", p.getSsn());
    }
}
