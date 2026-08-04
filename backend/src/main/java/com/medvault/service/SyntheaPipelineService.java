package com.medvault.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.model.*;
import com.medvault.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SyntheaPipelineService {

    private static final Logger log = LoggerFactory.getLogger(SyntheaPipelineService.class);
    private static final String SYNTHEA_JAR_NAME = "synthea-with-dependencies.jar";
    private static final String SYNTHEA_JAR_URL = "https://github.com/synthetichealth/synthea/releases/download/v3.0.0/synthea-with-dependencies.jar";
    
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public SyntheaPipelineService(PatientRepository patientRepository,
                                  EncounterRepository encounterRepository,
                                  AllergyRepository allergyRepository,
                                  DiagnosisRepository diagnosisRepository,
                                  PrescriptionRepository prescriptionRepository,
                                  VitalsRepository vitalsRepository,
                                  UserRepository userRepository,
                                  AuditLogRepository auditLogRepository,
                                  ObjectMapper objectMapper) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getPipelineStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        Path toolsDir = getToolsPath();
        Path jarPath = toolsDir.resolve(SYNTHEA_JAR_NAME);
        
        boolean jarExists = Files.exists(jarPath);
        status.put("syntheaEngineReady", true);
        status.put("syntheaJarDownloaded", jarExists);
        status.put("syntheaJarPath", jarPath.toAbsolutePath().toString());
        status.put("frameworkVersion", "Synthea v3.0.0 (HL7 FHIR R4 Standard)");
        status.put("javaVersion", System.getProperty("java.version"));
        status.put("totalPatientsInSystem", patientRepository.count());
        status.put("supportedStates", List.of("Massachusetts", "New York", "California", "Texas", "Florida", "Illinois"));
        return status;
    }

    private Path getToolsPath() {
        Path userDir = Paths.get(System.getProperty("user.dir"));
        Path tools = userDir.resolve("tools");
        if (!Files.exists(tools)) {
            try {
                Files.createDirectories(tools);
            } catch (IOException e) {
                log.error("Failed to create tools directory: {}", e.getMessage());
            }
        }
        return tools;
    }

    public synchronized boolean ensureSyntheaJarDownloaded() {
        Path toolsDir = getToolsPath();
        Path jarPath = toolsDir.resolve(SYNTHEA_JAR_NAME);
        if (Files.exists(jarPath) && jarPath.toFile().length() > 1000000) {
            return true;
        }

        log.info("Downloading official Synthea framework executable from GitHub releases...");
        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(SYNTHEA_JAR_URL))
                    .GET()
                    .build();
            
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() == 200) {
                Files.copy(response.body(), jarPath, StandardCopyOption.REPLACE_EXISTING);
                log.info("Successfully downloaded Synthea framework JAR to {}", jarPath);
                return true;
            } else {
                log.warn("Synthea download returned HTTP status {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("Failed to download Synthea JAR: {}", e.getMessage(), e);
        }
        return false;
    }

    @Transactional
    public Map<String, Object> executePipeline(int count, String state, String createdByUsername) {
        boolean jarReady = ensureSyntheaJarDownloaded();
        if (!jarReady) {
            throw new RuntimeException("Synthea Framework JAR is unavailable and could not be downloaded.");
        }

        try {
            return runSyntheaCli(count, state, createdByUsername);
        } catch (Exception e) {
            log.error("Synthea CLI pipeline execution failed: {}", e.getMessage(), e);
            throw new RuntimeException("Synthea CLI execution failed: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> runSyntheaCli(int count, String state, String createdByUsername) throws Exception {
        Path toolsDir = getToolsPath();
        Path jarPath = toolsDir.resolve(SYNTHEA_JAR_NAME);
        Path outputDir = toolsDir.resolve("output");

        if (Files.exists(outputDir)) {
            deleteDirectory(outputDir.toFile());
        }
        Files.createDirectories(outputDir);

        String stateParam = (state != null && !state.trim().isEmpty()) ? state.trim() : "Massachusetts";
        
        List<String> cmd = List.of(
                "java", "-jar", jarPath.toAbsolutePath().toString(),
                "-p", String.valueOf(count),
                stateParam,
                "--exporter.fhir.export=true",
                "--exporter.fhir.use_us_core_ig=false",
                "--exporter.base_directory=" + outputDir.toAbsolutePath()
        );

        log.info("Running official Synthea CLI command: {}", String.join(" ", cmd));
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(toolsDir.toFile());
        Process process = pb.start();
        
        boolean finished = process.waitFor(180, java.util.concurrent.TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Synthea CLI process timed out after 180 seconds.");
        }

        if (process.exitValue() != 0) {
            throw new RuntimeException("Synthea CLI exited with code " + process.exitValue());
        }

        Path fhirDir = outputDir.resolve("fhir");
        if (!Files.exists(fhirDir)) {
            throw new RuntimeException("Synthea completed but output fhir directory was not found.");
        }

        int patientsIngested = 0;
        int encountersIngested = 0;
        int allergiesIngested = 0;
        int conditionsIngested = 0;
        int prescriptionsIngested = 0;
        int vitalsIngested = 0;
        List<Patient> createdPatients = new ArrayList<>();

        File[] jsonFiles = fhirDir.toFile().listFiles((dir, name) -> name.endsWith(".json") && !name.contains("practitioner") && !name.contains("hospital"));
        if (jsonFiles != null) {
            for (File file : jsonFiles) {
                String jsonStr = Files.readString(file.toPath());
                Map<String, Object> metrics = parseAndSaveFhirBundle(jsonStr, createdByUsername);
                if (metrics.containsKey("patient")) {
                    createdPatients.add((Patient) metrics.get("patient"));
                }
                patientsIngested += (int) metrics.getOrDefault("patientsCount", 0);
                encountersIngested += (int) metrics.getOrDefault("encountersCount", 0);
                allergiesIngested += (int) metrics.getOrDefault("allergiesCount", 0);
                conditionsIngested += (int) metrics.getOrDefault("conditionsCount", 0);
                prescriptionsIngested += (int) metrics.getOrDefault("prescriptionsCount", 0);
                vitalsIngested += (int) metrics.getOrDefault("vitalsCount", 0);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("patientsIngested", patientsIngested);
        result.put("encountersIngested", encountersIngested);
        result.put("allergiesIngested", allergiesIngested);
        result.put("conditionsIngested", conditionsIngested);
        result.put("prescriptionsIngested", prescriptionsIngested);
        result.put("vitalsIngested", vitalsIngested);
        result.put("patients", createdPatients);
        result.put("message", "Synthea Framework Pipeline successfully generated and ingested " + patientsIngested + " patient bundles.");

        return result;
    }

    @Transactional
    public Map<String, Object> parseAndSaveFhirBundle(String bundleJson, String createdByUsername) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        int encountersCount = 0;
        int allergiesCount = 0;
        int conditionsCount = 0;
        int prescriptionsCount = 0;
        int vitalsCount = 0;

        try {
            JsonNode root = objectMapper.readTree(bundleJson);
            if (!root.has("entry") || !root.get("entry").isArray()) {
                metrics.put("error", "Invalid FHIR Bundle: missing 'entry' array.");
                return metrics;
            }

            JsonNode entries = root.get("entry");
            JsonNode patientNode = null;
            List<JsonNode> encounterNodes = new ArrayList<>();
            List<JsonNode> allergyNodes = new ArrayList<>();
            List<JsonNode> conditionNodes = new ArrayList<>();
            List<JsonNode> medRequestNodes = new ArrayList<>();
            List<JsonNode> obsNodes = new ArrayList<>();

            for (JsonNode entry : entries) {
                if (entry.has("resource")) {
                    JsonNode res = entry.get("resource");
                    String resType = res.path("resourceType").asText();
                    switch (resType) {
                        case "Patient":
                            if (patientNode == null) patientNode = res;
                            break;
                        case "Encounter":
                            encounterNodes.add(res);
                            break;
                        case "AllergyIntolerance":
                            allergyNodes.add(res);
                            break;
                        case "Condition":
                            conditionNodes.add(res);
                            break;
                        case "MedicationRequest":
                            medRequestNodes.add(res);
                            break;
                        case "Observation":
                            obsNodes.add(res);
                            break;
                    }
                }
            }

            if (patientNode == null) {
                metrics.put("error", "No Patient resource found in bundle.");
                return metrics;
            }

            // Create Patient Entity
            Patient patient = extractPatientFromNode(patientNode);
            Patient savedPatient = patientRepository.save(patient);
            metrics.put("patient", savedPatient);
            metrics.put("patientsCount", 1);

            User defaultDoctor = userRepository.findByUsername("doctor").orElse(null);
            User defaultNurse = userRepository.findByUsername("nurse").orElse(null);
            User attendingUser = defaultDoctor != null ? defaultDoctor : userRepository.findAll().stream().findFirst().orElse(null);

            // Ingest Encounters
            for (JsonNode encNode : encounterNodes) {
                Encounter enc = new Encounter();
                enc.setPatient(savedPatient);
                enc.setAttendingProvider(attendingUser);
                enc.setEncounterType(encNode.path("class").path("code").asText("OUTPATIENT").toUpperCase());
                enc.setChiefComplaint(encNode.path("reasonCode").path(0).path("text").asText("Synthea Synthetic Wellness Evaluation"));
                enc.setClinicalNotes("Ingested from Synthea FHIR R4 Bundle. Patient evaluated for routine monitoring.");
                enc.setDischargeSummary("Routine encounter completed. Follow up as required.");
                enc.setStatus(encNode.path("status").asText("completed").toUpperCase());
                
                String startDate = encNode.path("period").path("start").asText();
                if (!startDate.isEmpty()) {
                    try {
                        enc.setEncounterDate(LocalDateTime.parse(startDate, DateTimeFormatter.ISO_DATE_TIME));
                    } catch (Exception e) {
                        enc.setEncounterDate(LocalDateTime.now().minusDays(new Random().nextInt(30)));
                    }
                } else {
                    enc.setEncounterDate(LocalDateTime.now().minusDays(new Random().nextInt(30)));
                }
                encounterRepository.save(enc);
                encountersCount++;
            }

            // Ingest Allergies
            for (JsonNode algNode : allergyNodes) {
                Allergy alg = new Allergy();
                alg.setPatient(savedPatient);
                alg.setRecordedBy(attendingUser);
                
                String allergen = algNode.path("code").path("text").asText();
                if (allergen.isEmpty()) {
                    allergen = algNode.path("code").path("coding").path(0).path("display").asText("Penicillin");
                }
                alg.setAllergenName(allergen);
                alg.setAllergenCode(algNode.path("code").path("coding").path(0).path("code").asText("70618"));
                alg.setCategory(algNode.path("category").path(0).asText("medication").toUpperCase());
                alg.setSeverity(algNode.path("criticality").asText("moderate").toUpperCase());
                alg.setReactionDescription("Synthea tracked adverse reaction: " + algNode.path("reaction").path(0).path("manifestation").path(0).path("text").asText("Mild rash and hives"));
                alg.setStatus("ACTIVE");
                allergyRepository.save(alg);
                allergiesCount++;
            }

            // Ingest Conditions / Diagnoses
            for (JsonNode condNode : conditionNodes) {
                Diagnosis diag = new Diagnosis();
                diag.setPatient(savedPatient);
                diag.setDoctor(attendingUser);
                
                String condName = condNode.path("code").path("text").asText();
                if (condName.isEmpty()) {
                    condName = condNode.path("code").path("coding").path(0).path("display").asText("Essential Hypertension");
                }
                diag.setConditionName(condName);
                
                String codeStr = condNode.path("code").path("coding").path(0).path("code").asText("I10");
                if (codeStr.matches("^[A-Z][0-9].*")) {
                    diag.setIcdCode(codeStr);
                    diag.setSnomedCode("38341003");
                } else {
                    diag.setSnomedCode(codeStr);
                    diag.setIcdCode("I10");
                }

                String onset = condNode.path("onsetDateTime").asText();
                if (!onset.isEmpty()) {
                    try {
                        diag.setOnsetDate(LocalDate.parse(onset.substring(0, 10)));
                    } catch (Exception e) {
                        diag.setOnsetDate(savedPatient.getDateOfBirth().plusYears(25));
                    }
                } else {
                    diag.setOnsetDate(savedPatient.getDateOfBirth().plusYears(25));
                }

                diag.setStatus("CHRONIC");
                diag.setNotes("Synthea longitudinal condition model: " + condName);
                diagnosisRepository.save(diag);
                conditionsCount++;
            }

            // Ingest Medication Requests
            for (JsonNode medNode : medRequestNodes) {
                Prescription rx = new Prescription();
                rx.setPatient(savedPatient);
                rx.setDoctor(attendingUser);
                
                String medName = medNode.path("medicationCodeableConcept").path("text").asText();
                if (medName.isEmpty()) {
                    medName = medNode.path("medicationCodeableConcept").path("coding").path(0).path("display").asText("Metformin 500 MG Oral Tablet");
                }
                rx.setMedicationName(medName);
                rx.setRxNormCode(medNode.path("medicationCodeableConcept").path("coding").path(0).path("code").asText("860975"));
                rx.setDosage("1 Tablet");
                rx.setRoute("Oral");
                rx.setFrequency("Once Daily");
                rx.setDurationDays(30);
                rx.setRefills(3);
                rx.setInstructions(medNode.path("dosageInstruction").path(0).path("text").asText("Take as directed with food."));
                rx.setStatus("ACTIVE");
                prescriptionRepository.save(rx);
                prescriptionsCount++;
            }

            // Ingest Observation Vitals
            if (!obsNodes.isEmpty()) {
                Vitals vit = new Vitals();
                vit.setPatient(savedPatient);
                vit.setRecordedBy(defaultNurse != null ? defaultNurse : attendingUser);
                
                int sys = 120, dia = 80;
                for (JsonNode obs : obsNodes) {
                    String code = obs.path("code").path("coding").path(0).path("code").asText();
                    double val = obs.path("valueQuantity").path("value").asDouble(0.0);
                    
                    if ("8480-6".equals(code)) sys = (int) val;
                    if ("8462-4".equals(code)) dia = (int) val;
                    if ("8867-4".equals(code) && val > 0) vit.setHeartRate((int) val);
                    if ("8310-5".equals(code) && val > 0) vit.setTemperature(val);
                    if ("2708-6".equals(code) && val > 0) vit.setOxygenSaturation((int) val);
                    if ("9279-1".equals(code) && val > 0) vit.setRespiratoryRate((int) val);
                    if ("29463-7".equals(code) && val > 0) vit.setWeightKg(val);
                    if ("8302-2".equals(code) && val > 0) vit.setHeightCm(val);
                    if ("15074-8".equals(code) && val > 0) vit.setBloodGlucose((int) val);
                }

                if (vit.getHeartRate() == null) vit.setHeartRate(72);
                if (vit.getTemperature() == null) vit.setTemperature(36.8);
                if (vit.getOxygenSaturation() == null) vit.setOxygenSaturation(98);
                if (vit.getRespiratoryRate() == null) vit.setRespiratoryRate(16);
                if (vit.getHeightCm() == null) vit.setHeightCm(172.0);
                if (vit.getWeightKg() == null) vit.setWeightKg(70.0);
                if (vit.getBloodGlucose() == null) vit.setBloodGlucose(95);
                vit.setBloodPressure(sys + "/" + dia);
                vit.setRecordedAt(LocalDateTime.now());

                vitalsRepository.save(vit);
                vitalsCount++;
            }

            metrics.put("encountersCount", encountersCount);
            metrics.put("allergiesCount", allergiesCount);
            metrics.put("conditionsCount", conditionsCount);
            metrics.put("prescriptionsCount", prescriptionsCount);
            metrics.put("vitalsCount", vitalsCount);

            auditLogRepository.save(new AuditLog(
                    createdByUsername != null ? createdByUsername : "SYSTEM",
                    "ROLE_ADMIN",
                    "INGEST_SYNTHEA_BUNDLE",
                    "PATIENT",
                    String.valueOf(savedPatient.getId()),
                    "Successfully ingested official Synthea FHIR R4 Bundle for: " + savedPatient.getFullName() + " (" + savedPatient.getPatientCode() + ")"
            ));

        } catch (Exception e) {
            log.error("Error parsing Synthea FHIR bundle: {}", e.getMessage(), e);
            metrics.put("error", e.getMessage());
        }

        return metrics;
    }

    private Patient extractPatientFromNode(JsonNode pNode) {
        Patient p = new Patient();
        String mrn = "SYN-PAT-" + (10000 + new Random().nextInt(90000));
        String ssn = String.format("%03d-%02d-%04d", 100 + new Random().nextInt(800), 10 + new Random().nextInt(89), 1000 + new Random().nextInt(8999));

        if (pNode.has("identifier")) {
            for (JsonNode idNode : pNode.get("identifier")) {
                String val = idNode.path("value").asText();
                String sys = idNode.path("system").asText();
                if (sys.contains("ssn") && !val.isEmpty()) {
                    ssn = val;
                } else if (!val.isEmpty()) {
                    mrn = val;
                }
            }
        }
        p.setPatientCode(mrn);
        p.setSsn(ssn);

        String given = pNode.path("name").path(0).path("given").path(0).asText("Synthea");
        String family = pNode.path("name").path(0).path("family").asText("Patient");
        p.setFullName(given + " " + family);

        String birthDateStr = pNode.path("birthDate").asText();
        if (!birthDateStr.isEmpty()) {
            try {
                p.setDateOfBirth(LocalDate.parse(birthDateStr));
            } catch (Exception e) {
                p.setDateOfBirth(LocalDate.of(1975, 5, 15));
            }
        } else {
            p.setDateOfBirth(LocalDate.of(1975, 5, 15));
        }

        p.setGender(pNode.path("gender").asText("female").toUpperCase());
        p.setBloodType(List.of("A+", "O+", "B+", "AB+", "O-", "A-").get(new Random().nextInt(6)));

        String line = pNode.path("address").path(0).path("line").path(0).asText("100 Healthcare Way");
        String city = pNode.path("address").path(0).path("city").asText("Boston");
        String state = pNode.path("address").path(0).path("state").asText("MA");
        p.setAddress(line + ", " + city + ", " + state);

        String phone = pNode.path("telecom").path(0).path("value").asText("+1 (555) 019-2834");
        p.setPhone(phone);
        p.setEmail(given.toLowerCase() + "." + family.toLowerCase() + "@synthea-health.org");

        p.setEmergencyContact("Emergency Contact - +1 (555) 999-0000");
        p.setInsuranceProvider("Blue Cross Blue Shield (Synthea Network)");
        p.setInsurancePolicyNumber("SYN-POL-" + (100000 + new Random().nextInt(899999)));
        p.setInsuranceGroupNumber("SYN-GRP-9001");
        p.setCoveragePlan("Comprehensive Gold Preferred");
        p.setMedicalAlerts("Synthea Interoperable FHIR R4 Bundle Profile");

        return p;
    }

    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) deleteDirectory(f);
                else f.delete();
            }
        }
        dir.delete();
    }
}
