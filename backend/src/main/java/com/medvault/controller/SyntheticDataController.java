package com.medvault.controller;

import com.medvault.service.SyntheaPipelineService;
import com.medvault.service.SyntheticDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/synthetic")
public class SyntheticDataController {

    private final SyntheticDataService syntheticDataService;
    private final SyntheaPipelineService syntheaPipelineService;

    public SyntheticDataController(SyntheticDataService syntheticDataService,
                                   SyntheaPipelineService syntheaPipelineService) {
        this.syntheticDataService = syntheticDataService;
        this.syntheaPipelineService = syntheaPipelineService;
    }

    @GetMapping("/pipeline-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<?> getPipelineStatus() {
        return ResponseEntity.ok(syntheaPipelineService.getPipelineStatus());
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> generateSyntheticCohort(@RequestBody Map<String, Object> payload, Authentication auth) {
        int count = 3;
        if (payload.containsKey("count")) {
            try {
                count = Integer.parseInt(payload.get("count").toString());
            } catch (Exception ignored) {}
        }
        if (count <= 0 || count > 50) {
            count = 3;
        }

        String state = (String) payload.getOrDefault("state", "Massachusetts");

        Map<String, Object> result = syntheaPipelineService.executePipeline(count, state, auth != null ? auth.getName() : "ADMIN");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ingest-bundle")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> ingestFhirBundle(@RequestBody String bundleJson, Authentication auth) {
        if (bundleJson == null || bundleJson.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bundle JSON content cannot be empty."));
        }

        Map<String, Object> metrics = syntheaPipelineService.parseAndSaveFhirBundle(bundleJson, auth != null ? auth.getName() : "ADMIN");
        return ResponseEntity.ok(metrics);
    }
}
