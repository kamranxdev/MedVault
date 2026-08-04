package com.medvault.service;

import com.medvault.model.AuditLog;
import com.medvault.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog logAction(Authentication authentication, String action, String entityName, String resourceId, String details) {
        String username = "SYSTEM";
        String primaryRole = "ROLE_SYSTEM";

        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
            List<String> authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            if (!authorities.isEmpty()) {
                primaryRole = authorities.get(0);
            }
        }

        return logAction(username, primaryRole, action, entityName, resourceId, details);
    }

    public AuditLog logAction(String username, String userRole, String action, String entityName, String resourceId, String details) {
        try {
            AuditLog log = new AuditLog(username, userRole, action, entityName, resourceId, details);
            AuditLog saved = auditLogRepository.save(log);
            logger.info("AUDIT LOG RECORDED: [{}] by user '{}' ({}) on entity '{}' (ID: {}) - {}", 
                    action, username, userRole, entityName, resourceId, details);
            return saved;
        } catch (Exception ex) {
            logger.error("AUDIT LOG FAILURE: Failed to save audit trail for action '{}' on entity '{}' (resource ID: {}) by user '{}': {}", 
                    action, entityName, resourceId, username, ex.getMessage(), ex);
            return null;
        }
    }
}
