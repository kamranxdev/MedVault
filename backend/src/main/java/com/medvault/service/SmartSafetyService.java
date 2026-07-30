package com.medvault.service;

import com.medvault.model.Allergy;

import com.medvault.model.AuditLog;
import com.medvault.repository.AllergyRepository;
import com.medvault.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartSafetyService {

    private final AllergyRepository allergyRepository;
    private final AuditLogRepository auditLogRepository;

    // Cross-reactivity & drug class mappings
    private static final Map<String, List<String>> DRUG_CLASS_CROSS_REACTIVITY = new HashMap<>();

    static {
        DRUG_CLASS_CROSS_REACTIVITY.put("PENICILLIN", List.of("PENICILLIN", "AMOXICILLIN", "AMPICILLIN", "AUGMENTIN", "PIPERACILLIN"));
        DRUG_CLASS_CROSS_REACTIVITY.put("CEPHALOSPORIN", List.of("CEPHALEXIN", "CEFTRIAXONE", "CEFAZOLIN", "CEFDINIR"));
        DRUG_CLASS_CROSS_REACTIVITY.put("SULFA", List.of("SULFAMETHOXAZOLE", "TRIMETHOPRIM", "BACTRIM", "SULFASALAZINE"));
        DRUG_CLASS_CROSS_REACTIVITY.put("NSAID", List.of("IBUPROFEN", "ASPIRIN", "NAPROXEN", "KETOROLAC", "MELOXICAM", "CELECOXIB"));
        DRUG_CLASS_CROSS_REACTIVITY.put("OPIOID", List.of("CODEINE", "MORPHINE", "OXYCODONE", "HYDROCODONE", "FENTANYL"));
        DRUG_CLASS_CROSS_REACTIVITY.put("ACE_INHIBITOR", List.of("LISINOPRIL", "ENALAPRIL", "RAMIPRIL", "CAPTOPRIL"));
    }

    public SmartSafetyService(AllergyRepository allergyRepository, AuditLogRepository auditLogRepository) {
        this.allergyRepository = allergyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public SafetyCheckResult checkPrescriptionSafety(Long patientId, String medicationName, String actorUsername, String actorRole) {
        List<Allergy> activeAllergies = allergyRepository.findByPatientIdAndStatus(patientId, "ACTIVE");
        String medUpper = medicationName.toUpperCase().trim();

        for (Allergy allergy : activeAllergies) {
            String allergenUpper = allergy.getAllergenName().toUpperCase().trim();

            // Direct name match
            if (medUpper.contains(allergenUpper) || allergenUpper.contains(medUpper)) {
                String details = "CONTRAINDICATION WARNING: Patient has documented active allergy to '" 
                        + allergy.getAllergenName() + "' (Severity: " + allergy.getSeverity() + "). Requested Rx: " + medicationName;

                // Log ERX_ALERT in immutable audit ledger
                auditLogRepository.save(new AuditLog(
                        actorUsername,
                        actorRole,
                        "ERX_ALERT",
                        "PRESCRIPTION",
                        String.valueOf(patientId),
                        details
                ));

                return new SafetyCheckResult(false, allergy.getSeverity(), allergy.getAllergenName(), details);
            }

            // Cross-reactivity drug class check
            for (Map.Entry<String, List<String>> entry : DRUG_CLASS_CROSS_REACTIVITY.entrySet()) {
                List<String> classMeds = entry.getValue();
                boolean allergenInClass = classMeds.stream().anyMatch(allergenUpper::contains);
                boolean medInClass = classMeds.stream().anyMatch(medUpper::contains);

                if (allergenInClass && medInClass) {
                    String details = "DRUG-CLASS CROSS-REACTIVITY WARNING: Patient has active " + entry.getKey() + " class allergy ('" 
                            + allergy.getAllergenName() + "', Severity: " + allergy.getSeverity() + "). High risk for prescribed: " + medicationName;

                    auditLogRepository.save(new AuditLog(
                            actorUsername,
                            actorRole,
                            "ERX_ALERT",
                            "PRESCRIPTION",
                            String.valueOf(patientId),
                            details
                    ));

                    return new SafetyCheckResult(false, "HIGH_RISK_" + allergy.getSeverity(), allergy.getAllergenName(), details);
                }
            }
        }

        return new SafetyCheckResult(true, "NONE", null, "No active allergy contraindications detected.");
    }

    public static class SafetyCheckResult {
        private final boolean safe;
        private final String severity;
        private final String conflictingAllergen;
        private final String message;

        public SafetyCheckResult(boolean safe, String severity, String conflictingAllergen, String message) {
            this.safe = safe;
            this.severity = severity;
            this.conflictingAllergen = conflictingAllergen;
            this.message = message;
        }

        public boolean isSafe() { return safe; }
        public String getSeverity() { return severity; }
        public String getConflictingAllergen() { return conflictingAllergen; }
        public String getMessage() { return message; }
    }
}
