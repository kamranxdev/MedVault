package com.medvault.dto;

import com.medvault.model.User;

public class DoctorRecommendationDTO {
    private User doctor;
    private int matchScore; // 0 to 100
    private String recommendedSpecialty;
    private String matchReason;
    private boolean verifiedLicense;

    public DoctorRecommendationDTO() {}

    public DoctorRecommendationDTO(User doctor, int matchScore, String recommendedSpecialty, String matchReason, boolean verifiedLicense) {
        this.doctor = doctor;
        this.matchScore = Math.min(100, Math.max(0, matchScore));
        this.recommendedSpecialty = recommendedSpecialty;
        this.matchReason = matchReason;
        this.verifiedLicense = verifiedLicense;
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
}
