package com.medvault.controller;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fhir/v1")
@CrossOrigin(origins = "*")
public class FhirController {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;

    public FhirController(PatientRepository patientRepository,
                          EncounterRepository encounterRepository,
                          AllergyRepository allergyRepository,
                          DiagnosisRepository diagnosisRepository,
                          PrescriptionRepository prescriptionRepository,
                          VitalsRepository vitalsRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
    }

    // FHIR R4 Patient Resource Endpoint
    @GetMapping("/Patient")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<Map<String, Object>> resources = patients.stream().map(p -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "Patient");
            r.put("id", p.getId().toString());
            r.put("identifier", List.of(
                Map.of("system", "urn:oid:2.16.840.1.113883.4.1", "value", p.getPatientCode()),
                Map.of("system", "urn:oid:2.16.840.1.113883.4.1.ssn", "value", p.getSsn() != null ? p.getSsn() : "")
            ));
            r.put("name", List.of(Map.of("text", p.getFullName())));
            r.put("gender", p.getGender() != null ? p.getGender().toLowerCase() : "unknown");
            r.put("birthDate", p.getDateOfBirth());
            r.put("telecom", List.of(
                Map.of("system", "phone", "value", p.getPhone() != null ? p.getPhone() : ""),
                Map.of("system", "email", "value", p.getEmail() != null ? p.getEmail() : "")
            ));
            r.put("address", List.of(Map.of("text", p.getAddress() != null ? p.getAddress() : "")));
            return r;
        }).collect(Collectors.toList());

        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("resourceType", "Bundle");
        bundle.put("type", "searchset");
        bundle.put("total", resources.size());
        bundle.put("entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList()));

        return ResponseEntity.ok(bundle);
    }

    // FHIR R4 Encounter Resource Endpoint
    @GetMapping("/Encounter")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirEncounters(@RequestParam(required = false) Long patientId) {
        List<Encounter> encounters = (patientId != null) ?
                encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId) :
                encounterRepository.findAll();

        List<Map<String, Object>> resources = encounters.stream().map(e -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "Encounter");
            r.put("id", e.getId().toString());
            r.put("status", e.getStatus() != null ? e.getStatus().toLowerCase() : "in-progress");
            r.put("class", Map.of("code", e.getEncounterType() != null ? e.getEncounterType() : "AMB"));
            r.put("subject", Map.of("reference", "Patient/" + e.getPatient().getId(), "display", e.getPatient().getFullName()));
            r.put("period", Map.of("start", e.getEncounterDate() != null ? e.getEncounterDate().toString() : ""));
            r.put("reasonCode", List.of(Map.of("text", e.getChiefComplaint() != null ? e.getChiefComplaint() : "")));
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resourceType", "Bundle", "type", "searchset", "total", resources.size(), "entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList())));
    }

    // FHIR R4 AllergyIntolerance Resource Endpoint
    @GetMapping("/AllergyIntolerance")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirAllergies(@RequestParam(required = false) Long patientId) {
        List<Allergy> allergies = (patientId != null) ?
                allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                allergyRepository.findAll();

        List<Map<String, Object>> resources = allergies.stream().map(a -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "AllergyIntolerance");
            r.put("id", a.getId().toString());
            r.put("clinicalStatus", Map.of("coding", List.of(Map.of("code", a.getStatus() != null ? a.getStatus().toLowerCase() : "active"))));
            r.put("category", List.of(a.getCategory() != null ? a.getCategory().toLowerCase() : "medication"));
            r.put("criticality", a.getSeverity() != null ? a.getSeverity().toLowerCase() : "moderate");
            r.put("code", Map.of("text", a.getAllergenName(), "coding", List.of(Map.of("code", a.getAllergenCode() != null ? a.getAllergenCode() : ""))));
            r.put("patient", Map.of("reference", "Patient/" + a.getPatient().getId()));
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resourceType", "Bundle", "type", "searchset", "total", resources.size(), "entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList())));
    }

    // FHIR R4 Condition (Diagnoses) Resource Endpoint
    @GetMapping("/Condition")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirConditions(@RequestParam(required = false) Long patientId) {
        List<Diagnosis> diagnoses = (patientId != null) ?
                diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                diagnosisRepository.findAll();

        List<Map<String, Object>> resources = diagnoses.stream().map(d -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "Condition");
            r.put("id", d.getId().toString());
            r.put("clinicalStatus", Map.of("coding", List.of(Map.of("code", d.getStatus() != null ? d.getStatus().toLowerCase() : "active"))));
            r.put("code", Map.of("text", d.getConditionName(), "coding", List.of(
                Map.of("system", "http://hl7.org/fhir/sid/icd-10", "code", d.getIcdCode() != null ? d.getIcdCode() : ""),
                Map.of("system", "http://snomed.info/sct", "code", d.getSnomedCode() != null ? d.getSnomedCode() : "")
            )));
            r.put("subject", Map.of("reference", "Patient/" + d.getPatient().getId()));
            r.put("onsetDateTime", d.getOnsetDate() != null ? d.getOnsetDate() : "");
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resourceType", "Bundle", "type", "searchset", "total", resources.size(), "entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList())));
    }

    // FHIR R4 MedicationRequest Resource Endpoint
    @GetMapping("/MedicationRequest")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirMedications(@RequestParam(required = false) Long patientId) {
        List<Prescription> prescriptions = (patientId != null) ?
                prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId) :
                prescriptionRepository.findAll();

        List<Map<String, Object>> resources = prescriptions.stream().map(p -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "MedicationRequest");
            r.put("id", p.getId().toString());
            r.put("status", p.getStatus() != null ? p.getStatus().toLowerCase() : "active");
            r.put("intent", "order");
            r.put("medicationCodeableConcept", Map.of("text", p.getMedicationName(), "coding", List.of(Map.of("code", p.getRxNormCode() != null ? p.getRxNormCode() : ""))));
            r.put("subject", Map.of("reference", "Patient/" + p.getPatient().getId()));
            r.put("dosageInstruction", List.of(Map.of("text", p.getDosage() + " " + p.getFrequency() + " via " + (p.getRoute() != null ? p.getRoute() : "Oral"))));
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resourceType", "Bundle", "type", "searchset", "total", resources.size(), "entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList())));
    }

    // FHIR R4 Observation (Vitals) Resource Endpoint
    @GetMapping("/Observation")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getFhirObservations(@RequestParam(required = false) Long patientId) {
        List<Vitals> vitals = (patientId != null) ?
                vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                vitalsRepository.findAll();

        List<Map<String, Object>> resources = vitals.stream().map(v -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("resourceType", "Observation");
            r.put("id", v.getId().toString());
            r.put("status", "final");
            r.put("category", List.of(Map.of("coding", List.of(Map.of("code", "vital-signs")))));
            r.put("subject", Map.of("reference", "Patient/" + v.getPatient().getId()));
            r.put("effectiveDateTime", v.getRecordedAt() != null ? v.getRecordedAt().toString() : "");
            r.put("component", List.of(
                Map.of("code", Map.of("text", "Blood Pressure"), "valueQuantity", Map.of("value", v.getBloodPressure() != null ? v.getBloodPressure() : "120/80", "unit", "mmHg")),
                Map.of("code", Map.of("text", "Heart Rate"), "valueQuantity", Map.of("value", v.getHeartRate(), "unit", "bpm")),
                Map.of("code", Map.of("text", "Body Temperature"), "valueQuantity", Map.of("value", v.getTemperature(), "unit", "C")),
                Map.of("code", Map.of("text", "Oxygen Saturation"), "valueQuantity", Map.of("value", v.getOxygenSaturation(), "unit", "%")),
                Map.of("code", Map.of("text", "Body Mass Index"), "valueQuantity", Map.of("value", v.getBmi() != null ? v.getBmi() : 0.0, "unit", "kg/m2"))
            ));
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resourceType", "Bundle", "type", "searchset", "total", resources.size(), "entry", resources.stream().map(res -> Map.of("resource", res)).collect(Collectors.toList())));
    }
}
