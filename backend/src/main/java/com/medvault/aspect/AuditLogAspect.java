package com.medvault.aspect;

import com.medvault.model.AuditLog;
import com.medvault.repository.AuditLogRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Aspect
@Component
public class AuditLogAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogAspect.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogAspect(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Pointcut("@annotation(org.springframework.security.access.prepost.PreAuthorize)")
    public void preAuthorizePointcut() {}

    @Pointcut("within(com.medvault.controller..*)")
    public void controllerPointcut() {}

    @AfterReturning(pointcut = "preAuthorizePointcut()", returning = "result")
    public void logAuthorizedAccess(JoinPoint joinPoint, Object result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;

        try {
            String username = auth.getName();
            String roles = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList().toString();

            AuditLog log = new AuditLog();
            log.setUsername(username);
            log.setUserRole(roles);
            log.setAction("AUTHORIZED_API_ACCESS");
            log.setEntityName(joinPoint.getSignature().getDeclaringType().getSimpleName());
            log.setDetails("Successfully executed endpoint: " + joinPoint.getSignature().toShortString());
            log.setTimestamp(LocalDateTime.now());

            auditLogRepository.save(log);
            logger.info("AOP AUDIT LOG (AUTHORIZED): [{}] by user '{}' ({}) on endpoint '{}'", 
                    log.getAction(), username, roles, joinPoint.getSignature().toShortString());
        } catch (Exception ex) {
            logger.error("AOP AUDIT LOG ERROR: Failed to log authorized access: {}", ex.getMessage());
        }
    }

    @AfterThrowing(pointcut = "preAuthorizePointcut() || controllerPointcut()", throwing = "ex")
    public void logDeniedAccess(JoinPoint joinPoint, Throwable ex) {
        if (!(ex instanceof AccessDeniedException)) return;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS";
        String roles = (auth != null && auth.isAuthenticated()) ? auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList().toString() : "NONE";

        try {
            AuditLog log = new AuditLog();
            log.setUsername(username);
            log.setUserRole(roles);
            log.setAction("ACCESS_DENIED");
            log.setEntityName(joinPoint.getSignature().getDeclaringType().getSimpleName());
            log.setDetails("Security violation / access denied on endpoint: " + joinPoint.getSignature().toShortString() + " - " + ex.getMessage());
            log.setTimestamp(LocalDateTime.now());

            auditLogRepository.save(log);
            logger.warn("AOP AUDIT LOG (DENIED): User '{}' ({}) attempted unauthorized access to endpoint '{}'", 
                    username, roles, joinPoint.getSignature().toShortString());
        } catch (Exception loggingEx) {
            logger.error("AOP AUDIT LOG ERROR: Failed to log access denial: {}", loggingEx.getMessage());
        }
    }
}
