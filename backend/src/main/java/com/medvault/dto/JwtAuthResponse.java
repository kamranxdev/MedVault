package com.medvault.dto;

import java.util.Set;

public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String fullName;
    private Set<String> roles;
    private Set<String> permissions;
    private String department;
    private Long userId;

    public JwtAuthResponse() {}

    public JwtAuthResponse(String accessToken, String username, String fullName, Set<String> roles, Set<String> permissions, String department, Long userId) {
        this.accessToken = accessToken;
        this.username = username;
        this.fullName = fullName;
        this.roles = roles;
        this.permissions = permissions;
        this.department = department;
        this.userId = userId;
    }

    public JwtAuthResponse(String accessToken, String username, String fullName, Set<String> roles, Long userId) {
        this.accessToken = accessToken;
        this.username = username;
        this.fullName = fullName;
        this.roles = roles;
        this.userId = userId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
