package com.medvault;

import com.medvault.model.Allergy;
import com.medvault.model.Diagnosis;
import com.medvault.model.Patient;
import com.medvault.model.Prescription;
import com.medvault.repository.AllergyRepository;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.PrescriptionRepository;
import com.medvault.service.AuditService;
import com.medvault.service.SmartSafetyService;
import com.medvault.service.SmartSafetyService.SafetyCheckResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class SmartSafetyServiceTest {

    private AllergyRepository allergyRepository;
    private PrescriptionRepository prescriptionRepository;
    private DiagnosisRepository diagnosisRepository;
    private PatientRepository patientRepository;
    private AuditService auditService;
    private SmartSafetyService safetyService;

    @BeforeEach
    public void setUp() {
        allergyRepository = Mockito.mock(AllergyRepository.class);
        prescriptionRepository = Mockito.mock(PrescriptionRepository.class);
        diagnosisRepository = Mockito.mock(DiagnosisRepository.class);
        patientRepository = Mockito.mock(PatientRepository.class);
        auditService = Mockito.mock(AuditService.class);

        safetyService = new SmartSafetyService(allergyRepository, prescriptionRepository, diagnosisRepository, patientRepository, auditService);
    }

    @Test
    public void testDirectIngredientMatch() {
        Allergy penicillinAllergy = new Allergy();
        penicillinAllergy.setAllergenName("Penicillin");
        penicillinAllergy.setStatus("ACTIVE");
        penicillinAllergy.setSeverity("SEVERE");

        when(allergyRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(penicillinAllergy));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Penicillin G 500mg", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect direct allergen match for Penicillin G");
        assertEquals("Penicillin", result.getConflictingAllergen());
        assertTrue(result.getMessage().contains("CONTRAINDICATION WARNING"));
    }

    @Test
    public void testNoFalsePositiveShortSubstrings() {
        Allergy catAllergy = new Allergy();
        catAllergy.setAllergenName("Cat Dander");
        catAllergy.setStatus("ACTIVE");
        catAllergy.setSeverity("MODERATE");

        when(allergyRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(catAllergy));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Catapres 0.1mg", "dr_smith", "ROLE_DOCTOR");

        assertTrue(result.isSafe(), "Should NOT trigger false positive for Cat Dander vs Catapres");
    }

    @Test
    public void testSameDrugClassMatch() {
        Allergy ibuprofenAllergy = new Allergy();
        ibuprofenAllergy.setAllergenName("Ibuprofen");
        ibuprofenAllergy.setStatus("ACTIVE");
        ibuprofenAllergy.setSeverity("SEVERE");

        when(allergyRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(ibuprofenAllergy));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Naproxen 500mg", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect NSAID drug class contraindication between Ibuprofen and Naproxen");
        assertTrue(result.getMessage().contains("DRUG-CLASS CONTRAINDICATION WARNING"));
    }

    @Test
    public void testBetaLactamCrossReactivity() {
        Allergy amoxicillinAllergy = new Allergy();
        amoxicillinAllergy.setAllergenName("Amoxicillin");
        amoxicillinAllergy.setStatus("ACTIVE");
        amoxicillinAllergy.setSeverity("LIFE_THREATENING");

        when(allergyRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(amoxicillinAllergy));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Ceftriaxone 1g", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect Beta-lactam cross-reactivity between Penicillins and Cephalosporins");
        assertTrue(result.getMessage().contains("CROSS-CLASS BETA-LACTAM SENSITIVITY WARNING"));
    }

    @Test
    public void testFoodExcipientAllergyTrigger() {
        Patient patient = new Patient();
        patient.setId(1L);
        patient.setFoodAllergies("Peanut, Soy");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Propofol 1%", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect Propofol excipient allergy warning for Peanut/Soy");
        assertTrue(result.getMessage().contains("FOOD/EXCIPIENT ALLERGY WARNING"));
    }

    @Test
    public void testDrugDrugInteraction_BleedingRisk() {
        Prescription activeRx = new Prescription();
        activeRx.setMedicationName("Warfarin");
        activeRx.setStatus("ACTIVE");

        when(prescriptionRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(activeRx));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Ibuprofen 400mg", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect DDI hemorrhage risk between Warfarin and NSAIDs");
        assertEquals("DDI_BLEED_RISK", result.getAlertType());
    }

    @Test
    public void testDrugDiseaseContraindication_BetaBlockerInAsthma() {
        Diagnosis asthma = new Diagnosis();
        asthma.setConditionName("Severe Asthma");
        asthma.setStatus("ACTIVE");

        when(diagnosisRepository.findByPatientIdAndStatus(1L, "ACTIVE")).thenReturn(List.of(asthma));

        SafetyCheckResult result = safetyService.checkPrescriptionSafety(1L, "Propranolol 40mg", "dr_smith", "ROLE_DOCTOR");

        assertFalse(result.isSafe(), "Should detect Beta-blocker contraindication in Asthma");
        assertEquals("CONTRAINDICATION_ASTHMA", result.getAlertType());
    }

    @Test
    public void testNullOrEmptyInputsHandledSafely() {
        SafetyCheckResult resultNullMed = safetyService.checkPrescriptionSafety(1L, null, "dr_smith", "ROLE_DOCTOR");
        assertTrue(resultNullMed.isSafe());

        SafetyCheckResult resultNullPatient = safetyService.checkPrescriptionSafety(null, "Aspirin", "dr_smith", "ROLE_DOCTOR");
        assertTrue(resultNullPatient.isSafe());
    }
}
