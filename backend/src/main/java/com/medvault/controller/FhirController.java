package com.medvault.controller;

import com.medvault.model.*;
import com.medvault.repository.*;
import com.medvault.security.PatientSecurityService;
import com.medvault.service.FhirService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fhir/v1")
@CrossOrigin(origins = "*")
public class FhirController {

    private final FhirService fhirService;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final PatientSecurityService patientSecurityService;

    public FhirController(FhirService fhirService,
                          PatientRepository patientRepository,
                          EncounterRepository encounterRepository,
                          AllergyRepository allergyRepository,
                          DiagnosisRepository diagnosisRepository,
                          PrescriptionRepository prescriptionRepository,
                          VitalsRepository vitalsRepository,
                          PatientSecurityService patientSecurityService) {
        this.fhirService = fhirService;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.patientSecurityService = patientSecurityService;
    }

    // ==========================================
    // FHIR R4 CONFORMANCE (CapabilityStatement)
    // ==========================================

    @GetMapping(value = "/metadata", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<Map<String, Object>> getMetadata() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.getCapabilityStatement());
    }

    // ==========================================
    // PATIENT RESOURCE ENDPOINTS (CRUD + Search)
    // ==========================================

    @GetMapping(value = "/Patient", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchPatients(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String identifier) {

        List<Patient> patients = patientRepository.findAll();

        if (name != null && !name.isEmpty()) {
            patients = patients.stream()
                    .filter(p -> p.getFullName() != null && p.getFullName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (gender != null && !gender.isEmpty()) {
            patients = patients.stream()
                    .filter(p -> p.getGender() != null && p.getGender().equalsIgnoreCase(gender))
                    .collect(Collectors.toList());
        }
        if (identifier != null && !identifier.isEmpty()) {
            patients = patients.stream()
                    .filter(p -> (p.getPatientCode() != null && p.getPatientCode().equalsIgnoreCase(identifier)) ||
                                 (p.getSsn() != null && p.getSsn().equalsIgnoreCase(identifier)))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> resources = patients.stream()
                .map(fhirService::toPatientResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Patient", resources));
    }

    @GetMapping(value = "/Patient/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getPatientById(@PathVariable Long id) {
        Optional<Patient> patientOpt = patientRepository.findById(id);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Patient/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toPatientResource(patientOpt.get()));
    }

    @PostMapping(value = "/Patient", consumes = MediaType.APPLICATION_JSON_VALUE, produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<Map<String, Object>> createPatient(@RequestBody Map<String, Object> fhirJson) {
        Patient saved = fhirService.createPatientFromFhir(fhirJson);
        Map<String, Object> createdResource = fhirService.toPatientResource(saved);

        return ResponseEntity.created(URI.create("/fhir/v1/Patient/" + saved.getId()))
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(createdResource);
    }

    @DeleteMapping(value = "/Patient/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Patient/" + id + " does not exist."));
        }
        patientRepository.deleteById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildOperationOutcome("information", "informational", "Patient/" + id + " deleted successfully."));
    }

    // ==========================================
    // PATIENT $everything CLINICAL DUMP
    // ==========================================

    @GetMapping(value = "/Patient/{id}/$everything", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getPatientEverything(@PathVariable Long id) {
        Map<String, Object> bundle = fhirService.getPatientEverythingBundle(id);
        if ("OperationOutcome".equalsIgnoreCase((String) bundle.get("resourceType"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(bundle);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(bundle);
    }

    // ==========================================
    // ENCOUNTER RESOURCE ENDPOINTS
    // ==========================================

    @GetMapping(value = "/Encounter", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchEncounters(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Encounter> encounters = (patientId != null) ?
                encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId) :
                encounterRepository.findAll().stream()
                        .filter(e -> e.getPatient() != null && patientSecurityService.canAccessPatient(auth, e.getPatient().getId()))
                        .collect(Collectors.toList());

        List<Map<String, Object>> resources = encounters.stream()
                .map(fhirService::toEncounterResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Encounter", resources));
    }

    @GetMapping(value = "/Encounter/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessEncounter(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getEncounterById(@PathVariable Long id) {
        Optional<Encounter> encounterOpt = encounterRepository.findById(id);
        if (encounterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Encounter/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toEncounterResource(encounterOpt.get()));
    }

    // ==========================================
    // ALLERGYINTOLERANCE RESOURCE ENDPOINTS
    // ==========================================

    @GetMapping(value = "/AllergyIntolerance", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchAllergies(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Allergy> allergies = (patientId != null) ?
                allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                allergyRepository.findAll().stream()
                        .filter(a -> a.getPatient() != null && patientSecurityService.canAccessPatient(auth, a.getPatient().getId()))
                        .collect(Collectors.toList());

        List<Map<String, Object>> resources = allergies.stream()
                .map(fhirService::toAllergyResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("AllergyIntolerance", resources));
    }

    @GetMapping(value = "/AllergyIntolerance/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessAllergy(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getAllergyById(@PathVariable Long id) {
        Optional<Allergy> allergyOpt = allergyRepository.findById(id);
        if (allergyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "AllergyIntolerance/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toAllergyResource(allergyOpt.get()));
    }

    // ==========================================
    // CONDITION RESOURCE ENDPOINTS
    // ==========================================

    @GetMapping(value = "/Condition", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchConditions(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Diagnosis> diagnoses = (patientId != null) ?
                diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                diagnosisRepository.findAll().stream()
                        .filter(d -> d.getPatient() != null && patientSecurityService.canAccessPatient(auth, d.getPatient().getId()))
                        .collect(Collectors.toList());

        List<Map<String, Object>> resources = diagnoses.stream()
                .map(fhirService::toConditionResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Condition", resources));
    }

    @GetMapping(value = "/Condition/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessDiagnosis(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getConditionById(@PathVariable Long id) {
        Optional<Diagnosis> diagnosisOpt = diagnosisRepository.findById(id);
        if (diagnosisOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Condition/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toConditionResource(diagnosisOpt.get()));
    }

    // ==========================================
    // MEDICATIONREQUEST RESOURCE ENDPOINTS
    // ==========================================

    @GetMapping(value = "/MedicationRequest", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchMedications(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Prescription> prescriptions = (patientId != null) ?
                prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId) :
                prescriptionRepository.findAll().stream()
                        .filter(p -> p.getPatient() != null && patientSecurityService.canAccessPatient(auth, p.getPatient().getId()))
                        .collect(Collectors.toList());

        List<Map<String, Object>> resources = prescriptions.stream()
                .map(fhirService::toMedicationRequestResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("MedicationRequest", resources));
    }

    @GetMapping(value = "/MedicationRequest/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPrescription(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getMedicationById(@PathVariable Long id) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        if (prescriptionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "MedicationRequest/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toMedicationRequestResource(prescriptionOpt.get()));
    }

    // ==========================================
    // OBSERVATION RESOURCE ENDPOINTS
    // ==========================================

    @GetMapping(value = "/Observation", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchObservations(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Vitals> vitals = (patientId != null) ?
                vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId) :
                vitalsRepository.findAll().stream()
                        .filter(v -> v.getPatient() != null && patientSecurityService.canAccessPatient(auth, v.getPatient().getId()))
                        .collect(Collectors.toList());

        List<Map<String, Object>> resources = vitals.stream()
                .map(fhirService::toObservationResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Observation", resources));
    }

    @GetMapping(value = "/Observation/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessVitals(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getObservationById(@PathVariable Long id) {
        Optional<Vitals> vitalsOpt = vitalsRepository.findById(id);
        if (vitalsOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Observation/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toObservationResource(vitalsOpt.get()));
    }
}
