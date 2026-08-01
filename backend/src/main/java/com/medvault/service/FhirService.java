package com.medvault.service;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FhirService {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final UserRepository userRepository;

    public FhirService(PatientRepository patientRepository,
                       EncounterRepository encounterRepository,
                       AllergyRepository allergyRepository,
                       DiagnosisRepository diagnosisRepository,
                       PrescriptionRepository prescriptionRepository,
                       VitalsRepository vitalsRepository,
                       UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // FHIR R4 CONFORMANCE (CapabilityStatement)
    // ==========================================

    public Map<String, Object> getCapabilityStatement() {
        Map<String, Object> statement = new LinkedHashMap<>();
        statement.put("resourceType", "CapabilityStatement");
        statement.put("id", "medvault-fhir-r4-capability");
        statement.put("status", "active");
        statement.put("date", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        statement.put("kind", "instance");
        statement.put("publisher", "MedVault Health Systems Engine");
        statement.put("fhirVersion", "4.0.1");
        statement.put("format", List.of("application/fhir+json", "application/json"));
        
        Map<String, Object> software = new LinkedHashMap<>();
        software.put("name", "MedVault Interoperability Core Engine");
        software.put("version", "1.0.0-GOLD-STANDARD");
        statement.put("software", software);

        List<Map<String, Object>> resourceCapabilities = List.of(
            createResourceCapability("Patient", List.of("read", "search-type", "create", "update", "delete"), List.of("_id", "name", "gender", "identifier")),
            createResourceCapability("Encounter", List.of("read", "search-type", "create", "update"), List.of("_id", "patient", "status", "class")),
            createResourceCapability("AllergyIntolerance", List.of("read", "search-type", "create", "update"), List.of("_id", "patient", "clinical-status", "criticality")),
            createResourceCapability("Condition", List.of("read", "search-type", "create", "update"), List.of("_id", "patient", "clinical-status", "code")),
            createResourceCapability("MedicationRequest", List.of("read", "search-type", "create", "update"), List.of("_id", "patient", "status", "intent")),
            createResourceCapability("Observation", List.of("read", "search-type", "create"), List.of("_id", "patient", "category", "code", "date"))
        );

        Map<String, Object> rest = new LinkedHashMap<>();
        rest.put("mode", "server");
        rest.put("security", Map.of(
            "cors", true,
            "service", List.of(Map.of(
                "coding", List.of(Map.of(
                    "system", "http://terminology.hl7.org/CodeSystem/restful-security-service",
                    "code", "OAuth",
                    "display", "OAuth2 / Bearer JWT Authentication"
                ))
            ))
        ));
        rest.put("resource", resourceCapabilities);

        statement.put("rest", List.of(rest));
        return statement;
    }

    private Map<String, Object> createResourceCapability(String type, List<String> interactions, List<String> searchParams) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("type", type);
        res.put("interaction", interactions.stream().map(i -> Map.of("code", i)).collect(Collectors.toList()));
        res.put("searchParam", searchParams.stream().map(p -> Map.of("name", p, "type", "string")).collect(Collectors.toList()));
        return res;
    }

    // ==========================================
    // FHIR RESOURCE BUILDERS & MAPPERS
    // ==========================================

    public Map<String, Object> toPatientResource(Patient p) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "Patient");
        r.put("id", p.getId().toString());
        r.put("active", true);

        // Identifiers (MRN & SSN)
        List<Map<String, Object>> identifiers = new ArrayList<>();
        if (p.getPatientCode() != null) {
            identifiers.add(Map.of(
                "use", "official",
                "system", "urn:oid:2.16.840.1.113883.4.1",
                "value", p.getPatientCode(),
                "type", Map.of("text", "Medical Record Number (MRN)")
            ));
        }
        if (p.getSsn() != null && !p.getSsn().isEmpty()) {
            identifiers.add(Map.of(
                "use", "secondary",
                "system", "urn:oid:2.16.840.1.113883.4.1.ssn",
                "value", p.getSsn(),
                "type", Map.of("text", "Social Security Number")
            ));
        }
        r.put("identifier", identifiers);

        // Name
        String fullName = p.getFullName() != null ? p.getFullName() : "Unknown";
        String[] parts = fullName.split(" ");
        String family = parts.length > 1 ? parts[parts.length - 1] : fullName;
        List<String> given = parts.length > 1 ? Arrays.asList(Arrays.copyOf(parts, parts.length - 1)) : List.of(fullName);

        Map<String, Object> nameMap = new LinkedHashMap<>();
        nameMap.put("use", "official");
        nameMap.put("text", fullName);
        nameMap.put("family", family);
        nameMap.put("given", given);
        r.put("name", List.of(nameMap));

        // Demographics
        r.put("gender", p.getGender() != null ? p.getGender().toLowerCase() : "unknown");
        if (p.getDateOfBirth() != null) {
            r.put("birthDate", p.getDateOfBirth().toString());
        }

        // Telecom
        List<Map<String, Object>> telecom = new ArrayList<>();
        if (p.getPhone() != null && !p.getPhone().isEmpty()) {
            telecom.add(Map.of("system", "phone", "value", p.getPhone(), "use", "mobile"));
        }
        if (p.getEmail() != null && !p.getEmail().isEmpty()) {
            telecom.add(Map.of("system", "email", "value", p.getEmail(), "use", "home"));
        }
        r.put("telecom", telecom);

        // Address
        if (p.getAddress() != null && !p.getAddress().isEmpty()) {
            r.put("address", List.of(Map.of("use", "home", "text", p.getAddress())));
        }

        // Extension: Emergency Contact & Coverage Plan
        List<Map<String, Object>> extensions = new ArrayList<>();
        if (p.getInsuranceProvider() != null) {
            extensions.add(Map.of("url", "http://medvault.com/fhir/StructureDefinition/insurance-provider", "valueString", p.getInsuranceProvider()));
        }
        if (p.getBloodType() != null) {
            extensions.add(Map.of("url", "http://medvault.com/fhir/StructureDefinition/blood-type", "valueString", p.getBloodType()));
        }
        if (!extensions.isEmpty()) {
            r.put("extension", extensions);
        }

        return r;
    }

    public Map<String, Object> toEncounterResource(Encounter e) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "Encounter");
        r.put("id", e.getId().toString());
        r.put("status", e.getStatus() != null ? e.getStatus().toLowerCase() : "finished");
        
        // Encounter Class (AMB - Ambulatory, IMP - Inpatient, EMER - Emergency)
        String typeCode = e.getEncounterType() != null ? e.getEncounterType() : "AMB";
        r.put("class", Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code", typeCode,
            "display", typeCode.equalsIgnoreCase("IMP") ? "Inpatient Encounter" : "Ambulatory Outpatient"
        ));

        // Patient Reference
        if (e.getPatient() != null) {
            r.put("subject", Map.of("reference", "Patient/" + e.getPatient().getId(), "display", e.getPatient().getFullName()));
        }

        // Provider Participant
        if (e.getAttendingProvider() != null) {
            r.put("participant", List.of(Map.of(
                "individual", Map.of("reference", "Practitioner/" + e.getAttendingProvider().getId(), "display", e.getAttendingProvider().getFullName())
            )));
        }

        // Period
        if (e.getEncounterDate() != null) {
            r.put("period", Map.of("start", e.getEncounterDate().toString()));
        }

        // Reason Code / Chief Complaint
        if (e.getChiefComplaint() != null) {
            r.put("reasonCode", List.of(Map.of("text", e.getChiefComplaint())));
        }

        // Notes Summary
        if (e.getClinicalNotes() != null) {
            r.put("text", Map.of("status", "generated", "div", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + e.getClinicalNotes() + "</div>"));
        }

        return r;
    }

    public Map<String, Object> toAllergyResource(Allergy a) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "AllergyIntolerance");
        r.put("id", a.getId().toString());

        // Clinical Status
        r.put("clinicalStatus", Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
            "code", a.getStatus() != null ? a.getStatus().toLowerCase() : "active"
        ))));

        // Verification Status
        r.put("verificationStatus", Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
            "code", "confirmed"
        ))));

        // Category & Criticality
        r.put("category", List.of(a.getCategory() != null ? a.getCategory().toLowerCase() : "medication"));
        r.put("criticality", a.getSeverity() != null ? a.getSeverity().toLowerCase() : "moderate");

        // Code (RxNorm / SNOMED CT / Text)
        Map<String, Object> codeMap = new LinkedHashMap<>();
        codeMap.put("text", a.getAllergenName());
        if (a.getAllergenCode() != null && !a.getAllergenCode().isEmpty()) {
            codeMap.put("coding", List.of(Map.of(
                "system", "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code", a.getAllergenCode(),
                "display", a.getAllergenName()
            )));
        }
        r.put("code", codeMap);

        // Patient Reference
        if (a.getPatient() != null) {
            r.put("patient", Map.of("reference", "Patient/" + a.getPatient().getId(), "display", a.getPatient().getFullName()));
        }

        if (a.getRecordedAt() != null) {
            r.put("recordedDate", a.getRecordedAt().toString());
        }

        // Reaction Details
        if (a.getReactionDescription() != null) {
            r.put("reaction", List.of(Map.of("manifestation", List.of(Map.of("text", a.getReactionDescription())))));
        }

        return r;
    }

    public Map<String, Object> toConditionResource(Diagnosis d) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "Condition");
        r.put("id", d.getId().toString());

        // Clinical Status
        r.put("clinicalStatus", Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/condition-clinical",
            "code", d.getStatus() != null ? d.getStatus().toLowerCase() : "active"
        ))));

        // Verification Status
        r.put("verificationStatus", Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            "code", "confirmed"
        ))));

        // Category: Problem List Item
        r.put("category", List.of(Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/condition-category",
            "code", "problem-list-item",
            "display", "Problem List Item"
        )))));

        // Clinical Codes (ICD-10 & SNOMED CT)
        List<Map<String, String>> codings = new ArrayList<>();
        if (d.getIcdCode() != null && !d.getIcdCode().isEmpty()) {
            codings.add(Map.of("system", "http://hl7.org/fhir/sid/icd-10", "code", d.getIcdCode(), "display", d.getConditionName()));
        }
        if (d.getSnomedCode() != null && !d.getSnomedCode().isEmpty()) {
            codings.add(Map.of("system", "http://snomed.info/sct", "code", d.getSnomedCode(), "display", d.getConditionName()));
        }

        Map<String, Object> codeMap = new LinkedHashMap<>();
        codeMap.put("text", d.getConditionName());
        codeMap.put("coding", codings);
        r.put("code", codeMap);

        // Subject Reference
        if (d.getPatient() != null) {
            r.put("subject", Map.of("reference", "Patient/" + d.getPatient().getId(), "display", d.getPatient().getFullName()));
        }

        if (d.getOnsetDate() != null) {
            r.put("onsetDateTime", d.getOnsetDate().toString());
        }

        if (d.getRecordedAt() != null) {
            r.put("recordedDate", d.getRecordedAt().toString());
        }

        return r;
    }

    public Map<String, Object> toMedicationRequestResource(Prescription p) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "MedicationRequest");
        r.put("id", p.getId().toString());
        r.put("status", p.getStatus() != null ? p.getStatus().toLowerCase() : "active");
        r.put("intent", "order");

        // Medication RxNorm Coding
        Map<String, Object> medConcept = new LinkedHashMap<>();
        medConcept.put("text", p.getMedicationName());
        if (p.getRxNormCode() != null && !p.getRxNormCode().isEmpty()) {
            medConcept.put("coding", List.of(Map.of(
                "system", "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code", p.getRxNormCode(),
                "display", p.getMedicationName()
            )));
        }
        r.put("medicationCodeableConcept", medConcept);

        // Patient Reference
        if (p.getPatient() != null) {
            r.put("subject", Map.of("reference", "Patient/" + p.getPatient().getId(), "display", p.getPatient().getFullName()));
        }

        // Requester Doctor
        if (p.getDoctor() != null) {
            r.put("requester", Map.of("reference", "Practitioner/" + p.getDoctor().getId(), "display", p.getDoctor().getFullName()));
        }

        if (p.getPrescribedAt() != null) {
            r.put("authoredOn", p.getPrescribedAt().toString());
        }

        // Dosage Instructions
        List<Map<String, Object>> dosageList = new ArrayList<>();
        Map<String, Object> dosageMap = new LinkedHashMap<>();
        dosageMap.put("text", (p.getDosage() != null ? p.getDosage() : "") + " " + (p.getFrequency() != null ? p.getFrequency() : "") + " via " + (p.getRoute() != null ? p.getRoute() : "Oral"));
        if (p.getRoute() != null) {
            dosageMap.put("route", Map.of("text", p.getRoute()));
        }
        dosageList.add(dosageMap);
        r.put("dosageInstruction", dosageList);

        return r;
    }

    public Map<String, Object> toObservationResource(Vitals v) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("resourceType", "Observation");
        r.put("id", v.getId().toString());
        r.put("status", "final");

        // Category: Vital Signs
        r.put("category", List.of(Map.of("coding", List.of(Map.of(
            "system", "http://terminology.hl7.org/CodeSystem/observation-category",
            "code", "vital-signs",
            "display", "Vital Signs"
        )))));

        // Code: Vital Signs Panel (LOINC 85354-9)
        r.put("code", Map.of(
            "coding", List.of(Map.of(
                "system", "http://loinc.org",
                "code", "85354-9",
                "display", "Blood pressure panel with all children optional"
            )),
            "text", "Longitudinal Vital Signs Flowsheet"
        ));

        // Subject Reference
        if (v.getPatient() != null) {
            r.put("subject", Map.of("reference", "Patient/" + v.getPatient().getId(), "display", v.getPatient().getFullName()));
        }

        if (v.getRecordedAt() != null) {
            r.put("effectiveDateTime", v.getRecordedAt().toString());
        }

        // Components with explicit LOINC codes & UCUM Units
        List<Map<String, Object>> components = new ArrayList<>();

        if (v.getBloodPressure() != null && v.getBloodPressure().contains("/")) {
            String[] bp = v.getBloodPressure().split("/");
            try {
                double sys = Double.parseDouble(bp[0].trim());
                double dia = Double.parseDouble(bp[1].trim());

                // LOINC 8480-6: Systolic Blood Pressure
                components.add(Map.of(
                    "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "8480-6", "display", "Systolic blood pressure")), "text", "Systolic BP"),
                    "valueQuantity", Map.of("value", sys, "unit", "mmHg", "system", "http://unitsofmeasure.org", "code", "mm[Hg]")
                ));

                // LOINC 8462-4: Diastolic Blood Pressure
                components.add(Map.of(
                    "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "8462-4", "display", "Diastolic blood pressure")), "text", "Diastolic BP"),
                    "valueQuantity", Map.of("value", dia, "unit", "mmHg", "system", "http://unitsofmeasure.org", "code", "mm[Hg]")
                ));
            } catch (Exception ignored) {}
        }

        if (v.getHeartRate() != null) {
            // LOINC 8867-4: Heart rate
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "8867-4", "display", "Heart rate")), "text", "Heart Rate"),
                "valueQuantity", Map.of("value", v.getHeartRate(), "unit", "beats/min", "system", "http://unitsofmeasure.org", "code", "/min")
            ));
        }

        if (v.getTemperature() != null) {
            // LOINC 8310-5: Body temperature
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "8310-5", "display", "Body temperature")), "text", "Body Temperature"),
                "valueQuantity", Map.of("value", v.getTemperature(), "unit", "C", "system", "http://unitsofmeasure.org", "code", "Cel")
            ));
        }

        if (v.getOxygenSaturation() != null) {
            // LOINC 2708-6: Oxygen saturation in Arterial blood by Pulse oximetry
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "2708-6", "display", "Oxygen saturation")), "text", "SpO2"),
                "valueQuantity", Map.of("value", v.getOxygenSaturation(), "unit", "%", "system", "http://unitsofmeasure.org", "code", "%")
            ));
        }

        if (v.getRespiratoryRate() != null) {
            // LOINC 9279-1: Respiratory rate
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "9279-1", "display", "Respiratory rate")), "text", "Respiratory Rate"),
                "valueQuantity", Map.of("value", v.getRespiratoryRate(), "unit", "breaths/min", "system", "http://unitsofmeasure.org", "code", "/min")
            ));
        }

        if (v.getWeightKg() != null) {
            // LOINC 29463-7: Body weight
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "29463-7", "display", "Body weight")), "text", "Weight"),
                "valueQuantity", Map.of("value", v.getWeightKg(), "unit", "kg", "system", "http://unitsofmeasure.org", "code", "kg")
            ));
        }

        if (v.getHeightCm() != null) {
            // LOINC 8302-2: Body height
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "8302-2", "display", "Body height")), "text", "Height"),
                "valueQuantity", Map.of("value", v.getHeightCm(), "unit", "cm", "system", "http://unitsofmeasure.org", "code", "cm")
            ));
        }

        if (v.getBmi() != null) {
            // LOINC 39156-5: Body mass index
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "39156-5", "display", "Body mass index")), "text", "BMI"),
                "valueQuantity", Map.of("value", v.getBmi(), "unit", "kg/m2", "system", "http://unitsofmeasure.org", "code", "kg/m2")
            ));
        }

        if (v.getBloodGlucose() != null) {
            // LOINC 15074-8: Glucose [Mass/volume] in Blood
            components.add(Map.of(
                "code", Map.of("coding", List.of(Map.of("system", "http://loinc.org", "code", "15074-8", "display", "Glucose in Blood")), "text", "Blood Glucose"),
                "valueQuantity", Map.of("value", v.getBloodGlucose(), "unit", "mg/dL", "system", "http://unitsofmeasure.org", "code", "mg/dL")
            ));
        }

        r.put("component", components);
        return r;
    }

    // ==========================================
    // FHIR BUNDLE & OPERATION OUTCOME BUILDERS
    // ==========================================

    public Map<String, Object> buildBundle(String resourceType, List<Map<String, Object>> resources) {
        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("resourceType", "Bundle");
        bundle.put("id", "bundle-" + UUID.randomUUID());
        bundle.put("type", "searchset");
        bundle.put("total", resources.size());
        bundle.put("entry", resources.stream().map(res -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("fullUrl", "http://localhost:8080/fhir/v1/" + res.get("resourceType") + "/" + res.get("id"));
            entry.put("resource", res);
            return entry;
        }).collect(Collectors.toList()));
        return bundle;
    }

    public Map<String, Object> buildOperationOutcome(String severity, String code, String message) {
        Map<String, Object> outcome = new LinkedHashMap<>();
        outcome.put("resourceType", "OperationOutcome");
        outcome.put("issue", List.of(Map.of(
            "severity", severity, // "fatal" | "error" | "warning" | "information"
            "code", code,         // "not-found" | "invalid" | "forbidden" | "informational"
            "diagnostics", message
        )));
        return outcome;
    }

    // ==========================================
    // FHIR $everything PATIENT CLINICAL DUMP
    // ==========================================

    public Map<String, Object> getPatientEverythingBundle(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient == null) {
            return buildOperationOutcome("error", "not-found", "Patient record with ID " + patientId + " was not found.");
        }

        List<Map<String, Object>> allResources = new ArrayList<>();
        allResources.add(toPatientResource(patient));

        encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId)
                .forEach(e -> allResources.add(toEncounterResource(e)));

        allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .forEach(a -> allResources.add(toAllergyResource(a)));

        diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .forEach(d -> allResources.add(toConditionResource(d)));

        prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId)
                .forEach(p -> allResources.add(toMedicationRequestResource(p)));

        vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .forEach(v -> allResources.add(toObservationResource(v)));

        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("resourceType", "Bundle");
        bundle.put("id", "everything-patient-" + patientId);
        bundle.put("type", "collection");
        bundle.put("total", allResources.size());
        bundle.put("entry", allResources.stream().map(res -> Map.of(
            "fullUrl", "http://localhost:8080/fhir/v1/" + res.get("resourceType") + "/" + res.get("id"),
            "resource", res
        )).collect(Collectors.toList()));

        return bundle;
    }

    // ==========================================
    // FHIR RESOURCE CREATION & UPDATE (INGEST)
    // ==========================================

    public Patient createPatientFromFhir(Map<String, Object> fhirJson) {
        Patient p = new Patient();

        if (fhirJson.containsKey("identifier")) {
            List<Map<String, Object>> identifiers = (List<Map<String, Object>>) fhirJson.get("identifier");
            for (Map<String, Object> idMap : identifiers) {
                String val = (String) idMap.get("value");
                String sys = (String) idMap.get("system");
                if ("urn:oid:2.16.840.1.113883.4.1.ssn".equalsIgnoreCase(sys)) {
                    p.setSsn(val);
                } else if (val != null && !val.isEmpty()) {
                    p.setPatientCode(val);
                }
            }
        }
        if (p.getPatientCode() == null) {
            p.setPatientCode("MRN-" + (100000 + new Random().nextInt(900000)));
        }

        if (fhirJson.containsKey("name")) {
            List<Map<String, Object>> names = (List<Map<String, Object>>) fhirJson.get("name");
            if (!names.isEmpty()) {
                String text = (String) names.get(0).get("text");
                if (text != null) {
                    p.setFullName(text);
                } else {
                    String family = (String) names.get(0).get("family");
                    List<String> given = (List<String>) names.get(0).get("given");
                    p.setFullName((given != null ? String.join(" ", given) : "") + " " + (family != null ? family : ""));
                }
            }
        }
        if (p.getFullName() == null || p.getFullName().trim().isEmpty()) {
            p.setFullName("FHIR Ingested Patient");
        }

        if (fhirJson.containsKey("gender")) {
            p.setGender((String) fhirJson.get("gender"));
        }
        if (fhirJson.containsKey("birthDate")) {
            try {
                p.setDateOfBirth(LocalDate.parse((String) fhirJson.get("birthDate")));
            } catch (Exception ignored) {}
        }
        if (fhirJson.containsKey("telecom")) {
            List<Map<String, Object>> telecoms = (List<Map<String, Object>>) fhirJson.get("telecom");
            for (Map<String, Object> tel : telecoms) {
                String sys = (String) tel.get("system");
                String val = (String) tel.get("value");
                if ("phone".equalsIgnoreCase(sys)) p.setPhone(val);
                if ("email".equalsIgnoreCase(sys)) p.setEmail(val);
            }
        }
        if (fhirJson.containsKey("address")) {
            List<Map<String, Object>> addrs = (List<Map<String, Object>>) fhirJson.get("address");
            if (!addrs.isEmpty()) {
                p.setAddress((String) addrs.get(0).get("text"));
            }
        }

        return patientRepository.save(p);
    }
}
