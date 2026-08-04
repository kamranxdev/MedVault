package com.medvault;

import com.medvault.model.Allergy;
import com.medvault.repository.AllergyRepository;
import com.medvault.service.AuditService;
import com.medvault.service.SmartSafetyService;
import com.medvault.service.SmartSafetyService.SafetyCheckResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class SmartSafetyServiceTest {

    private AllergyRepository allergyRepository;
    private AuditService auditService;
    private SmartSafetyService safetyService;

    @BeforeEach
    public void setUp() {
        allergyRepository = Mockito.mock(AllergyRepository.class);
        auditService = Mockito.mock(AuditService.class);
        safetyService = new SmartSafetyService(allergyRepository, auditService);
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
}
