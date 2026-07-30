package com.medvault.service;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SyntheticDataService {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final VitalsRepository vitalsRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    private static final String[] FIRST_NAMES = {"Kamran", "Aarav", "Rohan", "Ananya", "Priya", "Rahul", "Vikram", "Neha", "Aditya", "Meera"};
    private static final String[] LAST_NAMES = {"Khan", "Patel", "Sharma", "Verma", "Gupta", "Menon", "Singh", "Reddy", "Joshi", "Deshmukh"};
    private static final String[] CITIES = {"Mumbai", "Delhi", "Bengaluru", "Ahmedabad", "Kolkata", "Hyderabad", "Chennai", "Pune"};
    private static final String[] INSURERS = {"Star Health Insurance", "HDFC ERGO Health", "ICICI Lombard", "Care Health Insurance", "Bajaj Allianz"};

    public SyntheticDataService(PatientRepository patientRepository,
                                EncounterRepository encounterRepository,
                                AllergyRepository allergyRepository,
                                DiagnosisRepository diagnosisRepository,
                                VitalsRepository vitalsRepository,
                                PrescriptionRepository prescriptionRepository,
                                UserRepository userRepository,
                                AuditLogRepository auditLogRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.vitalsRepository = vitalsRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public List<Patient> generateCohort(int count, String createdByUsername) {
        User doctor = userRepository.findByUsername("doctor").orElse(null);
        User nurse = userRepository.findByUsername("nurse").orElse(null);

        List<Patient> generated = new ArrayList<>();
        Random rand = new Random();

        for (int i = 0; i < count; i++) {
            String firstName = FIRST_NAMES[rand.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[rand.nextInt(LAST_NAMES.length)];
            String fullName = firstName + " " + lastName;
            String mrn = "SYN-PAT-" + (1000 + rand.nextInt(9000));
            String ssn = String.format("%03d-%02d-%04d", 100 + rand.nextInt(800), 10 + rand.nextInt(89), 1000 + rand.nextInt(8999));
            String city = CITIES[rand.nextInt(CITIES.length)];
            String insurer = INSURERS[rand.nextInt(INSURERS.length)];

            Patient p = new Patient();
            p.setPatientCode(mrn);
            p.setSsn(ssn);
            p.setFullName(fullName);
            p.setDateOfBirth(LocalDate.of(1955 + rand.nextInt(45), 1 + rand.nextInt(12), 1 + rand.nextInt(28)));
            p.setGender(rand.nextBoolean() ? "Female" : "Male");
            p.setBloodType(List.of("A+", "O+", "B+", "AB+", "O-", "A-").get(rand.nextInt(6)));
            p.setPhone("+1 (555) " + (100 + rand.nextInt(899)) + "-" + (1000 + rand.nextInt(8999)));
            p.setEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@synthetic-health.org");
            p.setAddress((100 + rand.nextInt(900)) + " Medical Park Way, " + city);
            p.setEmergencyContact("Next of Kin - +1 (555) " + (100 + rand.nextInt(899)) + "-9999");
            p.setInsuranceProvider(insurer);
            p.setInsurancePolicyNumber("POL-" + (100000 + rand.nextInt(899999)));
            p.setInsuranceGroupNumber("GRP-" + (1000 + rand.nextInt(8999)));
            p.setCoveragePlan("Comprehensive Gold Choice");
            p.setMedicalAlerts("Synthetic Cohort Profile - High statistical fidelity");

            Patient saved = patientRepository.save(p);
            generated.add(saved);

            // Add Coded Allergies
            if (rand.nextBoolean()) {
                Allergy alg = new Allergy();
                alg.setPatient(saved);
                alg.setAllergenName(List.of("Penicillin", "Sulfamethoxazole", "Ibuprofen", "Latex", "Peanuts").get(rand.nextInt(5)));
                alg.setAllergenCode("RxNorm-" + (1000 + rand.nextInt(9000)));
                alg.setCategory(alg.getAllergenName().equalsIgnoreCase("Latex") ? "ENVIRONMENTAL" : "DRUG");
                alg.setSeverity(List.of("MODERATE", "SEVERE", "LIFE_THREATENING").get(rand.nextInt(3)));
                alg.setReactionDescription("Acute urticaria, rash, respiratory wheezing upon exposure.");
                alg.setStatus("ACTIVE");
                alg.setRecordedBy(doctor);
                allergyRepository.save(alg);
            }

            // Add Coded Diagnoses (Problem List)
            Diagnosis diag = new Diagnosis();
            diag.setPatient(saved);
            diag.setDoctor(doctor != null ? doctor : userRepository.findAll().get(0));
            diag.setConditionName(List.of("Essential Hypertension", "Type 2 Diabetes Mellitus", "Hyperlipidemia", "Bronchial Asthma").get(rand.nextInt(4)));
            diag.setIcdCode(List.of("I10", "E11.9", "E78.5", "J45.909").get(rand.nextInt(4)));
            diag.setSnomedCode(List.of("59621000", "44054006", "55822004", "195967001").get(rand.nextInt(4)));
            diag.setOnsetDate(saved.getDateOfBirth().plusYears(30));
            diag.setStatus("CHRONIC");
            diag.setNotes("Longitudinal synthetic condition tracking active care plan.");
            diagnosisRepository.save(diag);

            // Add Encounters History
            for (int e = 0; e < 2; e++) {
                Encounter enc = new Encounter();
                enc.setPatient(saved);
                enc.setAttendingProvider(doctor != null ? doctor : userRepository.findAll().get(0));
                enc.setEncounterType(List.of("OUTPATIENT", "INPATIENT", "EMERGENCY", "TELEHEALTH").get(rand.nextInt(4)));
                enc.setChiefComplaint("Routine clinical evaluation and vital assessment.");
                enc.setClinicalNotes("Patient evaluated in good general standing. Regimen adjusted as appropriate.");
                enc.setDischargeSummary("Patient discharged with routine home care instructions.");
                enc.setStatus("COMPLETED");
                enc.setEncounterDate(LocalDateTime.now().minusDays(10 * (e + 1)));
                encounterRepository.save(enc);
            }

            // Add Longitudinal Time-Series Vitals (3 entries for trend plotting)
            for (int v = 0; v < 3; v++) {
                Vitals vit = new Vitals();
                vit.setPatient(saved);
                vit.setRecordedBy(nurse != null ? nurse : userRepository.findAll().get(0));
                int sys = 115 + rand.nextInt(35);
                int dia = 75 + rand.nextInt(20);
                vit.setBloodPressure(sys + "/" + dia);
                vit.setHeartRate(65 + rand.nextInt(30));
                vit.setTemperature(36.4 + (rand.nextInt(12) / 10.0));
                vit.setOxygenSaturation(96 + rand.nextInt(4));
                vit.setRespiratoryRate(14 + rand.nextInt(6));
                vit.setHeightCm(160.0 + rand.nextInt(30));
                vit.setWeightKg(60.0 + rand.nextInt(40));
                vit.setBloodGlucose(90 + rand.nextInt(60));
                vit.setRecordedAt(LocalDateTime.now().minusDays(v * 7));
                vitalsRepository.save(vit);
            }

            // Add Prescription
            if (doctor != null) {
                Prescription rx = new Prescription();
                rx.setPatient(saved);
                rx.setDoctor(doctor);
                rx.setMedicationName(List.of("Metformin HCl", "Lisinopril", "Atorvastatin", "Albuterol Inhaler").get(rand.nextInt(4)));
                rx.setDosage("10mg");
                rx.setRoute("Oral");
                rx.setFrequency("Once Daily");
                rx.setDurationDays(30);
                rx.setRefills(3);
                rx.setInstructions("Take as directed with food.");
                rx.setStatus("ACTIVE");
                prescriptionRepository.save(rx);
            }

            auditLogRepository.save(new AuditLog(
                    createdByUsername != null ? createdByUsername : "SYSTEM",
                    "ROLE_ADMIN",
                    "CREATE",
                    "SYNTHETIC_PATIENT",
                    String.valueOf(saved.getId()),
                    "Generated Synthea-aligned synthetic cohort profile: " + fullName + " (" + mrn + ")"
            ));
        }

        return generated;
    }
}
