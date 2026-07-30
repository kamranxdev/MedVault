package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String userRole;
    private String action; // CREATE, READ, UPDATE, DELETE, LOGIN, ERX_ALERT
    private String entityName;
    private String resourceId;
    private String ipAddress = "127.0.0.1";
    
    @Column(length = 2000)
    private String details;

    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(String username, String userRole, String action, String entityName, String details) {
        this.username = username;
        this.userRole = userRole;
        this.action = action;
        this.entityName = entityName;
        this.details = details;
    }

    public AuditLog(String username, String userRole, String action, String entityName, String resourceId, String details) {
        this.username = username;
        this.userRole = userRole;
        this.action = action;
        this.entityName = entityName;
        this.resourceId = resourceId;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
