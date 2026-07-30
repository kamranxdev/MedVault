package com.medvault.controller;

import com.medvault.model.AuditLog;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public List<AuditLog> getAuditLogs(@RequestParam(value = "search", required = false) String search) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        if (search == null || search.trim().isEmpty()) {
            return logs;
        }

        String q = search.toLowerCase().trim();
        return logs.stream().filter(l -> 
            (l.getUsername() != null && l.getUsername().toLowerCase().contains(q)) ||
            (l.getUserRole() != null && l.getUserRole().toLowerCase().contains(q)) ||
            (l.getAction() != null && l.getAction().toLowerCase().contains(q)) ||
            (l.getEntityName() != null && l.getEntityName().toLowerCase().contains(q)) ||
            (l.getResourceId() != null && l.getResourceId().toLowerCase().contains(q)) ||
            (l.getDetails() != null && l.getDetails().toLowerCase().contains(q))
        ).toList();
    }
}
