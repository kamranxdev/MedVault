package com.medvault.service;

import com.medvault.dto.DoctorRecommendationDTO;
import com.medvault.model.Appointment;
import com.medvault.model.Diagnosis;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DiagnosisRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorMatchingService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AppointmentRepository appointmentRepository;

    private static final Map<String, String> CONDITION_SPECIALTY_MAP = new LinkedHashMap<>();

    static {
        CONDITION_SPECIALTY_MAP.put("HYPERTENSION", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("CHEST PAIN", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("ANGINA", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("ARRHYTHMIA", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("HEART", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("CAD", "Cardiology");

        CONDITION_SPECIALTY_MAP.put("ASTHMA", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("COPD", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("PNEUMONIA", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("BRONCHITIS", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("LUNG", "Pulmonology");

        CONDITION_SPECIALTY_MAP.put("DIABETES", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("THYROID", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("INSULIN", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("HORMONAL", "Endocrinology");

        CONDITION_SPECIALTY_MAP.put("ARTHRITIS", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("FRACTURE", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("JOINT PAIN", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("BACK PAIN", "Orthopedics");

        CONDITION_SPECIALTY_MAP.put("RASH", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("ECZEMA", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("PSORIASIS", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("SKIN", "Dermatology");

        CONDITION_SPECIALTY_MAP.put("MIGRAINE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("SEIZURE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("STROKE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("NEURO", "Neurology");

        CONDITION_SPECIALTY_MAP.put("GERD", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("GASTRITIS", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("STOMACH", "Gastroenterology");

        CONDITION_SPECIALTY_MAP.put("KIDNEY", "Nephrology");
        CONDITION_SPECIALTY_MAP.put("RENAL", "Nephrology");
        CONDITION_SPECIALTY_MAP.put("CKD", "Nephrology");

        CONDITION_SPECIALTY_MAP.put("DEPRESSION", "Psychiatry");
        CONDITION_SPECIALTY_MAP.put("ANXIETY", "Psychiatry");
        CONDITION_SPECIALTY_MAP.put("MENTAL", "Psychiatry");
    }

    public DoctorMatchingService(UserRepository userRepository,
                                 PatientRepository patientRepository,
                                 DiagnosisRepository diagnosisRepository,
                                 AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<DoctorRecommendationDTO> recommendDoctorsForPatient(Long patientId, String visitReason) {
        Patient patient = patientId != null ? patientRepository.findById(patientId).orElse(null) : null;
        List<Diagnosis> activeDiagnoses = patientId != null ? diagnosisRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        List<Appointment> pastAppointments = patientId != null ? appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId) : Collections.emptyList();

        // Determine target specialty
        String targetSpecialty = determineTargetSpecialty(visitReason, activeDiagnoses, patient);

        // Fetch all doctors
        List<User> doctors = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR")))
                .collect(Collectors.toList());

        Set<Long> pastDoctorIds = pastAppointments.stream()
                .filter(a -> a.getDoctor() != null)
                .map(a -> a.getDoctor().getId())
                .collect(Collectors.toSet());

        List<DoctorRecommendationDTO> recommendations = new ArrayList<>();

        for (User doc : doctors) {
            int score = 40; // Base score
            String docSpec = doc.getSpecialization() != null ? doc.getSpecialization().trim() : "";
            boolean isSpecMatch = false;

            if (!targetSpecialty.equals("General Practice") && !docSpec.isEmpty()) {
                if (docSpec.equalsIgnoreCase(targetSpecialty) || docSpec.toLowerCase().contains(targetSpecialty.toLowerCase())) {
                    score += 45;
                    isSpecMatch = true;
                } else if (docSpec.equalsIgnoreCase("Internal Medicine") || docSpec.equalsIgnoreCase("General Practice") || docSpec.equalsIgnoreCase("Family Medicine")) {
                    score += 25;
                }
            } else if (docSpec.equalsIgnoreCase("Internal Medicine") || docSpec.equalsIgnoreCase("General Practice") || docSpec.equalsIgnoreCase("Family Medicine")) {
                score += 35;
                isSpecMatch = true;
            }

            // License & Credentials check
            boolean isVerified = "VERIFIED".equalsIgnoreCase(doc.getVerificationStatus()) && doc.getLicenseNumber() != null && !doc.getLicenseNumber().trim().isEmpty();
            if (isVerified) {
                score += 15;
            }

            // Experience bonus
            if (doc.getYearsOfExperience() != null) {
                score += Math.min(10, doc.getYearsOfExperience() / 2);
            }

            // Past relationship bonus
            boolean hasSeenDoctor = pastDoctorIds.contains(doc.getId());
            if (hasSeenDoctor) {
                score += 10;
            }

            String matchReason = (isSpecMatch ? "Direct Specialty Match (" + docSpec + "). " : "")
                    + (isVerified ? "Verified Practice License (" + doc.getLicenseNumber() + "). " : "License Verification Pending. ")
                    + (hasSeenDoctor ? "Previous Attending Physician." : "");

            recommendations.add(new DoctorRecommendationDTO(doc, score, targetSpecialty, matchReason, isVerified));
        }

        // Sort descending by match score
        recommendations.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return recommendations;
    }

    private String determineTargetSpecialty(String visitReason, List<Diagnosis> diagnoses, Patient patient) {
        String combinedText = (visitReason != null ? visitReason + " " : "")
                + diagnoses.stream().map(Diagnosis::getConditionName).collect(Collectors.joining(" ")) + " "
                + (patient != null && patient.getSeriousConditions() != null ? patient.getSeriousConditions() : "");

        combinedText = combinedText.toUpperCase();

        for (Map.Entry<String, String> entry : CONDITION_SPECIALTY_MAP.entrySet()) {
            if (combinedText.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "General Practice";
    }
}
