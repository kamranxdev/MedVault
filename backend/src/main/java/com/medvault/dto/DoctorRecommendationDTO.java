package com.medvault.dto;

import com.medvault.model.User;
import java.util.ArrayList;
import java.util.List;

public class DoctorRecommendationDTO {
    private User doctor;
    private int matchScore; // 0 to 100
    private int specialtyFitScore;
    private int continuityScore;
    private int workloadScore;
    private int urgencyScore;
    private String triageRiskLevel; // ROUTINE, URGENT, EMERGENT
    private String triageSummary;
    private String recommendedSpecialty;
    private String matchReason;
    private boolean verifiedLicense;
    private List<String> reasoningBreakdown = new ArrayList<>();
    private List<String> recommendedSlots = new ArrayList<>();

    public DoctorRecommendationDTO() {}

    public DoctorRecommendationDTO(User doctor, int matchScore, String recommendedSpecialty, String matchReason, boolean verifiedLicense) {
        this.doctor = doctor;
        this.matchScore = Math.min(100, Math.max(0, matchScore));
        this.recommendedSpecialty = recommendedSpecialty;
        this.matchReason = matchReason;
        this.verifiedLicense = verifiedLicense;
    }

    public DoctorRecommendationDTO(User doctor, int matchScore, int specialtyFitScore, int continuityScore,
                                   int workloadScore, int urgencyScore, String triageRiskLevel, String triageSummary,
                                   String recommendedSpecialty, String matchReason, boolean verifiedLicense,
                                   List<String> reasoningBreakdown, List<String> recommendedSlots) {
        this.doctor = doctor;
        this.matchScore = Math.min(100, Math.max(0, matchScore));
        this.specialtyFitScore = Math.min(100, Math.max(0, specialtyFitScore));
        this.continuityScore = Math.min(100, Math.max(0, continuityScore));
        this.workloadScore = Math.min(100, Math.max(0, workloadScore));
        this.urgencyScore = Math.min(100, Math.max(0, urgencyScore));
        this.triageRiskLevel = triageRiskLevel;
        this.triageSummary = triageSummary;
        this.recommendedSpecialty = recommendedSpecialty;
        this.matchReason = matchReason;
        this.verifiedLicense = verifiedLicense;
        this.reasoningBreakdown = reasoningBreakdown != null ? reasoningBreakdown : new ArrayList<>();
        this.recommendedSlots = recommendedSlots != null ? recommendedSlots : new ArrayList<>();
    }

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public int getSpecialtyFitScore() {
        return specialtyFitScore;
    }

    public void setSpecialtyFitScore(int specialtyFitScore) {
        this.specialtyFitScore = specialtyFitScore;
    }

    public int getContinuityScore() {
        return continuityScore;
    }

    public void setContinuityScore(int continuityScore) {
        this.continuityScore = continuityScore;
    }

    public int getWorkloadScore() {
        return workloadScore;
    }

    public void setWorkloadScore(int workloadScore) {
        this.workloadScore = workloadScore;
    }

    public int getUrgencyScore() {
        return urgencyScore;
    }

    public void setUrgencyScore(int urgencyScore) {
        this.urgencyScore = urgencyScore;
    }

    public String getTriageRiskLevel() {
        return triageRiskLevel;
    }

    public void setTriageRiskLevel(String triageRiskLevel) {
        this.triageRiskLevel = triageRiskLevel;
    }

    public String getTriageSummary() {
        return triageSummary;
    }

    public void setTriageSummary(String triageSummary) {
        this.triageSummary = triageSummary;
    }

    public String getRecommendedSpecialty() {
        return recommendedSpecialty;
    }

    public void setRecommendedSpecialty(String recommendedSpecialty) {
        this.recommendedSpecialty = recommendedSpecialty;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public boolean isVerifiedLicense() {
        return verifiedLicense;
    }

    public void setVerifiedLicense(boolean verifiedLicense) {
        this.verifiedLicense = verifiedLicense;
    }

    public List<String> getReasoningBreakdown() {
        return reasoningBreakdown;
    }

    public void setReasoningBreakdown(List<String> reasoningBreakdown) {
        this.reasoningBreakdown = reasoningBreakdown;
    }

    public List<String> getRecommendedSlots() {
        return recommendedSlots;
    }

    public void setRecommendedSlots(List<String> recommendedSlots) {
        this.recommendedSlots = recommendedSlots;
    }
}
