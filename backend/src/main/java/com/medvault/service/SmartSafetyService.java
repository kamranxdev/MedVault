package com.medvault.service;

import com.medvault.model.Allergy;
import com.medvault.model.Diagnosis;
import com.medvault.model.Patient;
import com.medvault.model.Prescription;
import com.medvault.repository.AllergyRepository;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartSafetyService {

    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    // Drug class mappings for precise cross-reactivity & DDIs
    private static final Map<String, List<String>> DRUG_CLASS_MAPPING = new LinkedHashMap<>();
    private static final Map<String, List<String>> CLASS_CROSS_SENSITIVITY = new LinkedHashMap<>();

    static {
        DRUG_CLASS_MAPPING.put("PENICILLIN", List.of("PENICILLIN", "AMOXICILLIN", "AMPICILLIN", "AUGMENTIN", "PIPERACILLIN", "AMOXI", "PENICILLIN G", "PENICILLIN V"));
        DRUG_CLASS_MAPPING.put("CEPHALOSPORIN", List.of("CEPHALEXIN", "CEFTRIAXONE", "CEFAZOLIN", "CEFDINIR", "CEFADROXIL", "CEFUROXIME", "CEFEPIME"));
        DRUG_CLASS_MAPPING.put("SULFA", List.of("SULFAMETHOXAZOLE", "TRIMETHOPRIM", "BACTRIM", "SULFASALAZINE", "SULFACETAMIDE"));
        DRUG_CLASS_MAPPING.put("NSAID", List.of("IBUPROFEN", "ASPIRIN", "NAPROXEN", "KETOROLAC", "MELOXICAM", "CELECOXIB", "DICLOFENAC", "INDOMETHACIN", "ADVIL", "ALEVE", "MOTRIN"));
        DRUG_CLASS_MAPPING.put("OPIOID", List.of("CODEINE", "MORPHINE", "OXYCODONE", "HYDROCODONE", "FENTANYL", "HYDROMORPHONE", "TRAMADOL", "PERCOCET", "VICODIN"));
        DRUG_CLASS_MAPPING.put("BENZODIAZEPINE", List.of("ALPRAZOLAM", "XANAX", "DIAZEPAM", "VALIUM", "LORAZEPAM", "ATIVAN", "CLONAZEPAM", "KLONOPIN"));
        DRUG_CLASS_MAPPING.put("BETA_BLOCKER", List.of("PROPRANOLOL", "ATENOLOL", "METOPROLOL", "CARVEDILOL", "LABETALOL", "BISOPROLOL", "INDERAL", "TOPROL"));
        DRUG_CLASS_MAPPING.put("ACE_INHIBITOR", List.of("LISINOPRIL", "ENALAPRIL", "RAMIPRIL", "CAPTOPRIL", "BENAZEPRIL", "PRINIVIL", "ZESTRIL"));
        DRUG_CLASS_MAPPING.put("FLUOROQUINOLONE", List.of("CIPROFLOXACIN", "LEVOFLOXACIN", "MOXIFLOXACIN", "CIPRO", "LEVAQUIN"));
        DRUG_CLASS_MAPPING.put("MACROLIDE", List.of("AZITHROMYCIN", "ERYTHROMYCIN", "CLARITHROMYCIN", "ZITHROMAX"));
        DRUG_CLASS_MAPPING.put("ANTICOAGULANT", List.of("WARFARIN", "COUMADIN", "HEPARIN", "RIVAROXABAN", "XARELTO", "APIXABAN", "ELIQUIS"));
        DRUG_CLASS_MAPPING.put("SSRI", List.of("FLUOXETINE", "PROZAC", "SERTRALINE", "ZOLOFT", "CITALOPRAM", "CELEXA", "ESCITALOPRAM", "LEXAPRO", "PAROXETINE", "PAXIL"));

        // Beta-lactam cross reactivity (Penicillin <-> Cephalosporin)
        CLASS_CROSS_SENSITIVITY.put("PENICILLIN", List.of("CEPHALOSPORIN"));
        CLASS_CROSS_SENSITIVITY.put("CEPHALOSPORIN", List.of("PENICILLIN"));
    }

    public SmartSafetyService(AllergyRepository allergyRepository, AuditService auditService) {
        this(allergyRepository, null, null, null, auditService);
    }

    @Autowired
    public SmartSafetyService(AllergyRepository allergyRepository,
                               PrescriptionRepository prescriptionRepository,
                               DiagnosisRepository diagnosisRepository,
                               PatientRepository patientRepository,
                               AuditService auditService) {
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public SafetyCheckResult checkPrescriptionSafety(Long patientId, String medicationName, String actorUsername, String actorRole) {
        if (patientId == null || medicationName == null || medicationName.trim().isEmpty()) {
            return new SafetyCheckResult(true, "NONE", null, "No medication specified for check.");
        }

        String medClean = medicationName.trim().toUpperCase();
        Patient patient = patientRepository != null ? patientRepository.findById(patientId).orElse(null) : null;

        // ==========================================
        // 1. DRUG ALLERGY & CROSS-REACTIVITY CHECK
        // ==========================================
        List<Allergy> activeAllergies = allergyRepository != null ? allergyRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        for (Allergy allergy : activeAllergies) {
            String allergenClean = allergy.getAllergenName() != null ? allergy.getAllergenName().trim() : "";
            if (allergenClean.isEmpty()) continue;

            // Direct / Token Match
            if (isDirectMatch(medClean, allergenClean)) {
                String details = "CONTRAINDICATION WARNING: Patient has documented active allergy to '" 
                        + allergy.getAllergenName() + "' (Severity: " + allergy.getSeverity() + "). Requested Rx: " + medicationName;
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, allergy.getSeverity(), allergy.getAllergenName(), details, "ALLERGY_DIRECT");
            }

            // Same Drug-Class Match
            String allergenClass = findDrugClass(allergenClean);
            String medClass = findDrugClass(medClean);

            if (allergenClass != null && allergenClass.equalsIgnoreCase(medClass)) {
                String details = "DRUG-CLASS CONTRAINDICATION WARNING: Patient has documented active " + allergenClass 
                        + " class allergy ('" + allergy.getAllergenName() + "', Severity: " + allergy.getSeverity() 
                        + "). High risk for prescribed medication: " + medicationName;
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "HIGH_RISK_" + allergy.getSeverity(), allergy.getAllergenName(), details, "ALLERGY_CLASS");
            }

            // Cross-Class Sensitivity (e.g. Penicillin <-> Cephalosporin)
            if (allergenClass != null && medClass != null) {
                List<String> sensitiveClasses = CLASS_CROSS_SENSITIVITY.get(allergenClass);
                if (sensitiveClasses != null && sensitiveClasses.contains(medClass)) {
                    String details = "CROSS-CLASS BETA-LACTAM SENSITIVITY WARNING: Active " 
                            + allergenClass + " allergy ('" + allergy.getAllergenName() 
                            + "') has potential cross-reactivity with " + medClass + " drug class (" + medicationName + ").";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResult(false, "CROSS_REACTIVITY_WARNING", allergy.getAllergenName(), details, "ALLERGY_CROSS");
                }
            }
        }

        // ==========================================
        // 2. FOOD & EXCIPIENT ALLERGY CHECK
        // ==========================================
        if (patient != null && patient.getFoodAllergies() != null && !patient.getFoodAllergies().trim().isEmpty()) {
            String foodAllergiesUpper = patient.getFoodAllergies().toUpperCase();
            
            if (foodAllergiesUpper.contains("PEANUT") || foodAllergiesUpper.contains("SOY")) {
                if (medClean.contains("PROPOFOL") || medClean.contains("CLEVIPREX") || medClean.contains("INTRALIPID")) {
                    String details = "FOOD/EXCIPIENT ALLERGY WARNING: Patient profile lists Peanut/Soy allergy. Medication '" 
                            + medicationName + "' contains soy/egg phospholipid emulsion.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResult(false, "SEVERE", "Peanut/Soy Excipient", details, "ALLERGY_FOOD");
                }
            }
            if (foodAllergiesUpper.contains("EGG")) {
                if (medClean.contains("PROPOFOL") || medClean.contains("INFLUENZA")) {
                    String details = "FOOD/EXCIPIENT ALLERGY WARNING: Patient profile lists Egg allergy. Medication '" 
                            + medicationName + "' contains egg-derived protein formulation.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResult(false, "SEVERE", "Egg Excipient", details, "ALLERGY_FOOD");
                }
            }
            if (foodAllergiesUpper.contains("SULFI")) {
                if (medClean.contains("EPINEPHRINE") || medClean.contains("DEXAMETHASONE")) {
                    String details = "EXCIPIENT SENSITIVITY WARNING: Patient profile lists Sulfite sensitivity. Formulations may contain sodium metabisulfite.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResult(false, "MODERATE", "Sulfite Excipient", details, "ALLERGY_FOOD");
                }
            }
        }

        // ==========================================
        // 3. DRUG-DRUG INTERACTION (DDI) CHECK
        // ==========================================
        List<Prescription> activeRxList = prescriptionRepository != null ? prescriptionRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        String newMedClass = findDrugClass(medClean);

        for (Prescription activeRx : activeRxList) {
            String activeMedClean = activeRx.getMedicationName().toUpperCase();
            String activeMedClass = findDrugClass(activeMedClean);

            // Duplicate Therapy Warning
            if (activeMedClean.equalsIgnoreCase(medClean) || (newMedClass != null && newMedClass.equalsIgnoreCase(activeMedClass))) {
                String details = "DUPLICATE THERAPY WARNING: Patient already has an active prescription for '" 
                        + activeRx.getMedicationName() + "' (Dosage: " + activeRx.getDosage() + ").";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "WARNING", activeRx.getMedicationName(), details, "DUPLICATE_THERAPY");
            }

            // Anticoagulant + NSAID / Aspirin -> High Bleeding Risk
            if ((isClass(newMedClass, activeMedClean, "ANTICOAGULANT") && isClass(activeMedClass, activeMedClean, "NSAID")) ||
                (isClass(newMedClass, medClean, "NSAID") && isClass(activeMedClass, activeMedClean, "ANTICOAGULANT"))) {
                String details = "CRITICAL DRUG-DRUG INTERACTION: Combining Anticoagulant (" + activeRx.getMedicationName() 
                        + ") with NSAID (" + medicationName + ") significantly increases risk of major internal / GI hemorrhage.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "CRITICAL", activeRx.getMedicationName(), details, "DDI_BLEED_RISK");
            }

            // Opioid + Benzodiazepine -> Respiratory Depression
            if ((isClass(newMedClass, medClean, "OPIOID") && isClass(activeMedClass, activeMedClean, "BENZODIAZEPINE")) ||
                (isClass(newMedClass, medClean, "BENZODIAZEPINE") && isClass(activeMedClass, activeMedClean, "OPIOID"))) {
                String details = "CRITICAL DRUG-DRUG INTERACTION: Concurrent prescribing of Opioids (" + medicationName 
                        + ") and Benzodiazepines (" + activeRx.getMedicationName() + ") results in severe CNS/respiratory depression & overdose risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "CRITICAL", activeRx.getMedicationName(), details, "DDI_RESPIRATORY_DEPRESSION");
            }

            // ACE Inhibitor + Potassium/Spironolactone -> Hyperkalemia
            if ((isClass(newMedClass, medClean, "ACE_INHIBITOR") && (activeMedClean.contains("SPIRONOLACTONE") || activeMedClean.contains("POTASSIUM"))) ||
                ((medClean.contains("SPIRONOLACTONE") || medClean.contains("POTASSIUM")) && isClass(activeMedClass, activeMedClean, "ACE_INHIBITOR"))) {
                String details = "DRUG-DRUG INTERACTION WARNING: ACE Inhibitor (" + medicationName 
                        + ") combined with Potassium-sparing agent (" + activeRx.getMedicationName() + ") elevates risk of severe hyperkalemia.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "HIGH", activeRx.getMedicationName(), details, "DDI_HYPERKALEMIA");
            }
        }

        // ==========================================
        // 4. DRUG-CONDITION CONTRAINDICATION CHECK
        // ==========================================
        List<Diagnosis> activeDiagnoses = diagnosisRepository != null ? diagnosisRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        String seriousCondSummary = (patient != null && patient.getSeriousConditions() != null) ? patient.getSeriousConditions().toUpperCase() : "";

        for (Diagnosis diag : activeDiagnoses) {
            String condUpper = diag.getConditionName().toUpperCase();

            // Beta Blocker in Asthma / COPD
            if (isClass(newMedClass, medClean, "BETA_BLOCKER") && (condUpper.contains("ASTHMA") || condUpper.contains("COPD") || condUpper.contains("BRONCHOSPASM"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: Non-selective Beta Blockers (" + medicationName 
                        + ") are contraindicated in active Asthma/COPD ('" + diag.getConditionName() + "') due to fatal bronchospasm risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "CRITICAL", diag.getConditionName(), details, "CONTRAINDICATION_ASTHMA");
            }

            // NSAID in Chronic Kidney Disease / Peptic Ulcer
            if (isClass(newMedClass, medClean, "NSAID") && (condUpper.contains("KIDNEY") || condUpper.contains("RENAL") || condUpper.contains("ULCER") || condUpper.contains("CKD"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: NSAID (" + medicationName 
                        + ") is contraindicated in patient with Renal Impairment / GI Ulcer disease ('" + diag.getConditionName() + "').";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "HIGH", diag.getConditionName(), details, "CONTRAINDICATION_RENAL");
            }

            // Metformin in Severe Renal Impairment
            if (medClean.contains("METFORMIN") && (condUpper.contains("RENAL FAILURE") || condUpper.contains("STAGE 4") || condUpper.contains("STAGE 5"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: Metformin is contraindicated in severe Renal Failure ('" 
                        + diag.getConditionName() + "') due to lactic acidosis risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResult(false, "CRITICAL", diag.getConditionName(), details, "CONTRAINDICATION_METFORMIN");
            }
        }

        // Additional serious condition string check
        if (isClass(newMedClass, medClean, "BETA_BLOCKER") && seriousCondSummary.contains("ASTHMA")) {
            String details = "DRUG-DISEASE CONTRAINDICATION: Patient serious condition history lists Asthma. Beta Blocker (" + medicationName + ") triggered warning.";
            logAlert(actorUsername, actorRole, patientId, details);
            return new SafetyCheckResult(false, "CRITICAL", "Asthma", details, "CONTRAINDICATION_ASTHMA");
        }

        return new SafetyCheckResult(true, "NONE", null, "No allergy, DDI, or disease contraindications detected. Prescription safe to proceed.", "SAFE");
    }

    private boolean isClass(String classFound, String medNameUpper, String targetClass) {
        if (targetClass.equalsIgnoreCase(classFound)) return true;
        List<String> list = DRUG_CLASS_MAPPING.get(targetClass);
        if (list != null) {
            for (String item : list) {
                if (medNameUpper.contains(item)) return true;
            }
        }
        return false;
    }

    private void logAlert(String actorUsername, String actorRole, Long patientId, String details) {
        auditService.logAction(
                actorUsername != null ? actorUsername : "SYSTEM",
                actorRole != null ? actorRole : "ROLE_DOCTOR",
                "ERX_SAFETY_ALERT",
                "PRESCRIPTION",
                String.valueOf(patientId),
                details
        );
    }

    private boolean isDirectMatch(String medName, String allergenName) {
        String medUpper = medName.toUpperCase();
        String allergenUpper = allergenName.toUpperCase();

        if (medUpper.equals(allergenUpper)) return true;

        Set<String> medTokens = extractTokens(medUpper);
        Set<String> allergenTokens = extractTokens(allergenUpper);

        for (String aToken : allergenTokens) {
            if (aToken.length() < 3) continue;
            for (String mToken : medTokens) {
                if (mToken.length() < 3) continue;
                if (mToken.equals(aToken)) return true;
            }
        }

        return false;
    }

    private Set<String> extractTokens(String input) {
        Set<String> tokens = new HashSet<>();
        String[] parts = input.split("[^A-Z0-9]+");
        for (String p : parts) {
            if (!p.trim().isEmpty()) {
                tokens.add(p.trim());
            }
        }
        return tokens;
    }

    private String findDrugClass(String name) {
        Set<String> tokens = extractTokens(name.toUpperCase());
        for (Map.Entry<String, List<String>> entry : DRUG_CLASS_MAPPING.entrySet()) {
            for (String classMed : entry.getValue()) {
                for (String t : tokens) {
                    if (t.length() >= 3 && t.equals(classMed)) {
                        return entry.getKey();
                    }
                }
            }
        }
        return null;
    }

    public static class SafetyCheckResult {
        private final boolean safe;
        private final String severity;
        private final String conflictingAllergen;
        private final String message;
        private final String alertType;

        public SafetyCheckResult(boolean safe, String severity, String conflictingAllergen, String message) {
            this(safe, severity, conflictingAllergen, message, "NONE");
        }

        public SafetyCheckResult(boolean safe, String severity, String conflictingAllergen, String message, String alertType) {
            this.safe = safe;
            this.severity = severity;
            this.conflictingAllergen = conflictingAllergen;
            this.message = message;
            this.alertType = alertType;
        }

        public boolean isSafe() { return safe; }
        public String getSeverity() { return severity; }
        public String getConflictingAllergen() { return conflictingAllergen; }
        public String getMessage() { return message; }
        public String getAlertType() { return alertType; }
    }
}
