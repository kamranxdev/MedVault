package com.medvault.service;

import com.medvault.model.AuditLog;
import com.medvault.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuditServiceTest {

    private AuditLogRepository auditLogRepository;
    private AuditService auditService;

    @BeforeEach
    public void setUp() {
        auditLogRepository = mock(AuditLogRepository.class);
        auditService = new AuditService(auditLogRepository);
    }

    @Test
    public void testLogActionWithAuthentication_Success() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("doctor_jane");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(auth).getAuthorities();

        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditService.logAction(auth, "READ", "PATIENT", "101", "Accessed patient file");

        assertNotNull(log);
        assertEquals("doctor_jane", log.getUsername());
        assertEquals("ROLE_DOCTOR", log.getUserRole());
        assertEquals("READ", log.getAction());
        assertEquals("PATIENT", log.getEntityName());
        assertEquals("101", log.getResourceId());
    }

    @Test
    public void testLogActionWithNullAuthentication_FallbackToSystem() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditService.logAction((Authentication) null, "SYSTEM_BATCH", "DATABASE", "0", "Automated cleanup");

        assertNotNull(log);
        assertEquals("SYSTEM", log.getUsername());
        assertEquals("ROLE_SYSTEM", log.getUserRole());
    }

    @Test
    public void testLogActionRepositoryException_SwallowsAndReturnsNull() {
        when(auditLogRepository.save(any(AuditLog.class))).thenThrow(new RuntimeException("Database error"));

        AuditLog log = auditService.logAction("user1", "ROLE_USER", "READ", "DATA", "1", "Test details");

        assertNull(log, "Should swallow exception gracefully and return null");
    }
}
