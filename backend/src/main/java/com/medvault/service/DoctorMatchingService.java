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

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorMatchingService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AppointmentRepository appointmentRepository;

    private static final Map<String, String> CONDITION_SPECIALTY_MAP = new LinkedHashMap<>();
    private static final Set<String> EMERGENT_KEYWORDS = new HashSet<>();
    private static final Set<String> URGENT_KEYWORDS = new HashSet<>();

    static {
        // Cardiology
        CONDITION_SPECIALTY_MAP.put("HYPERTENSION", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("CHEST PAIN", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("ANGINA", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("ARRHYTHMIA", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("HEART", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("CAD", "Cardiology");
        CONDITION_SPECIALTY_MAP.put("PALPITATIONS", "Cardiology");

        // Pulmonology
        CONDITION_SPECIALTY_MAP.put("ASTHMA", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("COPD", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("PNEUMONIA", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("BRONCHITIS", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("LUNG", "Pulmonology");
        CONDITION_SPECIALTY_MAP.put("DYSPNEA", "Pulmonology");

        // Endocrinology
        CONDITION_SPECIALTY_MAP.put("DIABETES", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("THYROID", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("INSULIN", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("HORMONAL", "Endocrinology");
        CONDITION_SPECIALTY_MAP.put("METABOLIC", "Endocrinology");

        // Orthopedics
        CONDITION_SPECIALTY_MAP.put("ARTHRITIS", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("FRACTURE", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("JOINT PAIN", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("BACK PAIN", "Orthopedics");
        CONDITION_SPECIALTY_MAP.put("SPRAIN", "Orthopedics");

        // Dermatology
        CONDITION_SPECIALTY_MAP.put("RASH", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("ECZEMA", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("PSORIASIS", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("SKIN", "Dermatology");
        CONDITION_SPECIALTY_MAP.put("LESION", "Dermatology");

        // Neurology
        CONDITION_SPECIALTY_MAP.put("MIGRAINE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("SEIZURE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("STROKE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("NEURO", "Neurology");
        CONDITION_SPECIALTY_MAP.put("HEADACHE", "Neurology");
        CONDITION_SPECIALTY_MAP.put("VERTIGO", "Neurology");

        // Gastroenterology
        CONDITION_SPECIALTY_MAP.put("GERD", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("GASTRITIS", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("STOMACH", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("ACID REFLUX", "Gastroenterology");
        CONDITION_SPECIALTY_MAP.put("ABDOMINAL PAIN", "Gastroenterology");

        // Nephrology
        CONDITION_SPECIALTY_MAP.put("KIDNEY", "Nephrology");
        CONDITION_SPECIALTY_MAP.put("RENAL", "Nephrology");
        CONDITION_SPECIALTY_MAP.put("CKD", "Nephrology");

        // Psychiatry
        CONDITION_SPECIALTY_MAP.put("DEPRESSION", "Psychiatry");
        CONDITION_SPECIALTY_MAP.put("ANXIETY", "Psychiatry");
        CONDITION_SPECIALTY_MAP.put("MENTAL", "Psychiatry");
        CONDITION_SPECIALTY_MAP.put("MOOD", "Psychiatry");

        // Emergency / Triage Keywords
        EMERGENT_KEYWORDS.add("CHEST PAIN");
        EMERGENT_KEYWORDS.add("STROKE");
        EMERGENT_KEYWORDS.add("ACUTE SHORTNESS OF BREATH");
        EMERGENT_KEYWORDS.add("SEVERE BLEEDING");
        EMERGENT_KEYWORDS.add("UNCONSCIOUS");
        EMERGENT_KEYWORDS.add("ANAPHYLAXIS");

        URGENT_KEYWORDS.add("HIGH FEVER");
        URGENT_KEYWORDS.add("ASTHMA ATTACK");
        URGENT_KEYWORDS.add("UNCONTROLLED BP");
        URGENT_KEYWORDS.add("ACUTE PAIN");
        URGENT_KEYWORDS.add("MIGRAINE");
        URGENT_KEYWORDS.add("FRACTURE");
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
        List<Appointment> allAppointments = appointmentRepository.findAll();

        // 1. Clinical Triage & Risk Stratification
        String triageLevel = evaluateTriageRiskLevel(visitReason, activeDiagnoses, patient);
        String triageSummary = generateTriageSummary(triageLevel, visitReason, activeDiagnoses);

        // 2. Target Specialty Determination
        String targetSpecialty = determineTargetSpecialty(visitReason, activeDiagnoses, patient);

        // Fetch all registered doctors
        List<User> doctors = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR")))
                .collect(Collectors.toList());

        // Count doctor appointment workload
        Map<Long, Long> doctorWorkloadMap = allAppointments.stream()
                .filter(a -> a.getDoctor() != null && !"CANCELLED".equals(a.getStatus()))
                .collect(Collectors.groupingBy(a -> a.getDoctor().getId(), Collectors.counting()));

        // Doctor-Patient past interaction history count
        Map<Long, Long> pastInteractionMap = pastAppointments.stream()
                .filter(a -> a.getDoctor() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getId(), Collectors.counting()));

        List<DoctorRecommendationDTO> recommendations = new ArrayList<>();

        for (User doc : doctors) {
            List<String> rationaleList = new ArrayList<>();
            String docSpec = doc.getSpecialization() != null ? doc.getSpecialization().trim() : "";

            // A. Specialty Fit Score (Weight: 45%)
            int specialtyFitScore = 40;
            if (!targetSpecialty.equalsIgnoreCase("General Practice") && !docSpec.isEmpty()) {
                if (docSpec.equalsIgnoreCase(targetSpecialty) || docSpec.toLowerCase().contains(targetSpecialty.toLowerCase())) {
                    specialtyFitScore = 100;
                    rationaleList.add("Direct Specialty Match: " + docSpec);
                } else if (docSpec.equalsIgnoreCase("Internal Medicine") || docSpec.equalsIgnoreCase("General Practice") || docSpec.equalsIgnoreCase("Family Medicine")) {
                    specialtyFitScore = 75;
                    rationaleList.add("Primary Care & Internal Medicine Coverage");
                } else {
                    specialtyFitScore = 50;
                }
            } else if (docSpec.equalsIgnoreCase("Internal Medicine") || docSpec.equalsIgnoreCase("General Practice") || docSpec.equalsIgnoreCase("Family Medicine")) {
                specialtyFitScore = 95;
                rationaleList.add("General Practice & Primary Care Specialist");
            } else {
                specialtyFitScore = 60;
            }

            // B. Continuity of Care Score (Weight: 25%)
            int continuityScore = 30;
            long previousVisits = pastInteractionMap.getOrDefault(doc.getId(), 0L);
            if (previousVisits >= 3) {
                continuityScore = 100;
                rationaleList.add("Primary Attending Physician (" + previousVisits + " previous visits)");
            } else if (previousVisits > 0) {
                continuityScore = 80;
                rationaleList.add("Prior Doctor-Patient Care Relationship (" + previousVisits + " past visit)");
            } else {
                continuityScore = 40;
            }

            // C. Workload Balance Score (Weight: 15%)
            long activeAppts = doctorWorkloadMap.getOrDefault(doc.getId(), 0L);
            int workloadScore = Math.max(30, 100 - (int) (activeAppts * 10));
            if (workloadScore >= 80) {
                rationaleList.add("Optimal Availability & Low Queue Load (" + activeAppts + " active appts)");
            }

            // D. Experience & Credentials Score (Weight: 15%)
            boolean isVerified = "VERIFIED".equalsIgnoreCase(doc.getVerificationStatus()) && doc.getLicenseNumber() != null && !doc.getLicenseNumber().trim().isEmpty();
            int experienceScore = 50;
            if (isVerified) {
                experienceScore += 30;
                rationaleList.add("Verified License: " + doc.getLicenseNumber());
            } else {
                rationaleList.add("License Verification Pending");
            }
            if (doc.getYearsOfExperience() != null) {
                experienceScore += Math.min(20, doc.getYearsOfExperience() * 2);
                rationaleList.add(doc.getYearsOfExperience() + "+ Years Medical Experience");
            }

            // E. Urgency Triage Adjustment
            int urgencyScore = "EMERGENT".equals(triageLevel) ? 95 : ("URGENT".equals(triageLevel) ? 80 : 60);

            // Composite Match Score (0 - 100)
            double composite = (specialtyFitScore * 0.45) + (continuityScore * 0.25) + (workloadScore * 0.15) + (experienceScore * 0.15);
            int finalMatchScore = (int) Math.round(composite);

            String matchReasonStr = String.join(" • ", rationaleList);

            // Generate smart recommended time slots
            List<String> recommendedSlots = generateSmartTimeSlots(targetSpecialty, triageLevel);

            DoctorRecommendationDTO dto = new DoctorRecommendationDTO(
                    doc, finalMatchScore, specialtyFitScore, continuityScore, workloadScore, urgencyScore,
                    triageLevel, triageSummary, targetSpecialty, matchReasonStr, isVerified, rationaleList, recommendedSlots
            );
            recommendations.add(dto);
        }

        // Sort descending by final composite match score
        recommendations.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return recommendations;
    }

    private String evaluateTriageRiskLevel(String visitReason, List<Diagnosis> activeDiagnoses, Patient patient) {
        String text = (visitReason != null ? visitReason + " " : "")
                + activeDiagnoses.stream().map(Diagnosis::getConditionName).collect(Collectors.joining(" ")) + " "
                + (patient != null && patient.getSeriousConditions() != null ? patient.getSeriousConditions() : "");
        text = text.toUpperCase();

        for (String keyword : EMERGENT_KEYWORDS) {
            if (text.contains(keyword)) return "EMERGENT";
        }
        for (String keyword : URGENT_KEYWORDS) {
            if (text.contains(keyword)) return "URGENT";
        }
        return "ROUTINE";
    }

    private String generateTriageSummary(String riskLevel, String visitReason, List<Diagnosis> diagnoses) {
        if ("EMERGENT".equals(riskLevel)) {
            return "Critical symptoms flagged in chief complaint. Priority same-day specialist consultation recommended.";
        } else if ("URGENT".equals(riskLevel)) {
            return "Moderate clinical urgency detected. Early consultation recommended within 24-48 hours.";
        }
        return "Standard routine consultation. Standard slot availability assigned.";
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

    private List<String> generateSmartTimeSlots(String specialty, String triageLevel) {
        List<String> slots = new ArrayList<>();
        if ("EMERGENT".equals(triageLevel)) {
            slots.add("08:30 AM (Priority Emergency)");
            slots.add("09:15 AM (Immediate Slot)");
            slots.add("10:00 AM (Priority Slot)");
            slots.add("11:30 AM (Same-day Priority)");
        } else if ("Cardiology".equalsIgnoreCase(specialty) || "Endocrinology".equalsIgnoreCase(specialty)) {
            slots.add("09:00 AM (Fasting Blood Work Preferred)");
            slots.add("10:30 AM (Morning Consult)");
            slots.add("02:15 PM (Afternoon Consult)");
            slots.add("04:00 PM (Late Afternoon)");
        } else {
            slots.add("09:30 AM (Morning Slot)");
            slots.add("11:15 AM (Pre-Lunch Slot)");
            slots.add("02:30 PM (Afternoon Slot)");
            slots.add("04:15 PM (Evening Slot)");
        }
        return slots;
    }
}

