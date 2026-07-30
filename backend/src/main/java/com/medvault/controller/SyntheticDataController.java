package com.medvault.controller;

import com.medvault.model.Patient;
import com.medvault.service.SyntheticDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/synthetic")
public class SyntheticDataController {

    private final SyntheticDataService syntheticDataService;

    public SyntheticDataController(SyntheticDataService syntheticDataService) {
        this.syntheticDataService = syntheticDataService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> generateSyntheticCohort(@RequestBody Map<String, Integer> payload, Authentication auth) {
        int count = payload.getOrDefault("count", 3);
        if (count <= 0 || count > 20) {
            count = 3;
        }

        List<Patient> cohort = syntheticDataService.generateCohort(count, auth.getName());
        return ResponseEntity.ok(Map.of(
                "message", "Successfully generated " + cohort.size() + " Synthea-aligned synthetic patient profiles.",
                "count", cohort.size(),
                "patients", cohort
        ));
    }
}
