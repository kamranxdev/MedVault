package com.medvault.model;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String code; // e.g., "PATIENT_READ", "PRESCRIPTION_CREATE"

    @Column(nullable = false, length = 30)
    private String category; // e.g., "PATIENT", "CLINICAL", "BILLING", "SYSTEM"

    private String description;

    public Permission() {}

    public Permission(String code, String category, String description) {
        this.code = code;
        this.category = category;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
