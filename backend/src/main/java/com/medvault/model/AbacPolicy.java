package com.medvault.model;

import jakarta.persistence.*;

@Entity
@Table(name = "abac_policies")
public class AbacPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String policyName;

    @Column(nullable = false, length = 50)
    private String targetResource;

    @Column(nullable = false, length = 20)
    private String action;

    @Column(nullable = false, length = 255)
    private String spelExpression;

    private boolean active = true;

    public AbacPolicy() {}

    public AbacPolicy(String policyName, String targetResource, String action, String spelExpression) {
        this.policyName = policyName;
        this.targetResource = targetResource;
        this.action = action;
        this.spelExpression = spelExpression;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getTargetResource() {
        return targetResource;
    }

    public void setTargetResource(String targetResource) {
        this.targetResource = targetResource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getSpelExpression() {
        return spelExpression;
    }

    public void setSpelExpression(String spelExpression) {
        this.spelExpression = spelExpression;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
