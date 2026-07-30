package com.medvault.config;

import com.medvault.model.*;
import com.medvault.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final MedicalRecordRepository recordRepository;
    private final VitalsRepository vitalsRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      PatientRepository patientRepository,
                      MedicalRecordRepository recordRepository,
                      VitalsRepository vitalsRepository,
                      PrescriptionRepository prescriptionRepository,
                      AppointmentRepository appointmentRepository,
                      AuditLogRepository auditLogRepository,
                      EncounterRepository encounterRepository,
                      AllergyRepository allergyRepository,
                      DiagnosisRepository diagnosisRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
        this.vitalsRepository = vitalsRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DataSeeder] Starting database teardown...");
        auditLogRepository.deleteAll();
        appointmentRepository.deleteAll();
        prescriptionRepository.deleteAll();
        vitalsRepository.deleteAll();
        recordRepository.deleteAll();
        diagnosisRepository.deleteAll();
        allergyRepository.deleteAll();
        encounterRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        System.out.println("[DataSeeder] Phase 1: Creating roles...");
        // 1. Create Roles
        Role adminRole = roleRepository.save(new Role("ROLE_ADMIN"));
        Role doctorRole = roleRepository.save(new Role("ROLE_DOCTOR"));
        Role nurseRole = roleRepository.save(new Role("ROLE_NURSE"));
        Role auditorRole = roleRepository.save(new Role("ROLE_AUDITOR"));
        Role patientRole = roleRepository.save(new Role("ROLE_PATIENT"));

        System.out.println("[DataSeeder] Phase 2: Creating users...");
        // 2. Create Users
        User admin = new User("admin", passwordEncoder.encode("admin123"), "admin@medvault.org", "Dr. Alexander Wright (Admin/Intake)");
        admin.setRoles(Set.of(adminRole));
        admin.setDepartment("Patient Intake & Administration");
        userRepository.save(admin);

        User doctor = new User("doctor", passwordEncoder.encode("doctor123"), "doctor@medvault.org", "Dr. Sarah Jenkins");
        doctor.setRoles(Set.of(doctorRole));
        doctor.setSpecialization("Cardiology & Internal Medicine");
        doctor.setDepartment("Cardiovascular Medicine");
        userRepository.save(doctor);

        User doctorJenkins = new User("doctor_jenkins", passwordEncoder.encode("doctor123"), "sarah.jenkins@medvault.org", "Dr. Sarah Jenkins");
        doctorJenkins.setRoles(Set.of(doctorRole));
        doctorJenkins.setSpecialization("Cardiology & Internal Medicine");
        doctorJenkins.setDepartment("Cardiovascular Medicine");
        userRepository.save(doctorJenkins);

        User doctorMarcus = new User("doctor_marcus", passwordEncoder.encode("doctor123"), "marcus.vance@medvault.org", "Dr. Marcus Vance");
        doctorMarcus.setRoles(Set.of(doctorRole));
        doctorMarcus.setSpecialization("Neurology & Internal Medicine");
        doctorMarcus.setDepartment("Neurological Sciences");
        userRepository.save(doctorMarcus);

        User nurse = new User("nurse", passwordEncoder.encode("nurse123"), "nurse@medvault.org", "Nurse Clara Barton");
        nurse.setRoles(Set.of(nurseRole));
        nurse.setDepartment("Emergency / ICU Bedside");
        userRepository.save(nurse);

        User nurseClara = new User("nurse_clara", passwordEncoder.encode("nurse123"), "clara.barton@medvault.org", "Nurse Clara Barton");
        nurseClara.setRoles(Set.of(nurseRole));
        nurseClara.setDepartment("Emergency / ICU Bedside");
        userRepository.save(nurseClara);

        User auditor = new User("auditor", passwordEncoder.encode("auditor123"), "auditor@medvault.org", "Inspector Vance (Compliance Auditor)");
        auditor.setRoles(Set.of(auditorRole));
        auditor.setDepartment("Regulatory Compliance & Forensics");
        userRepository.save(auditor);

        User patientUser = new User("patient", passwordEncoder.encode("patient123"), "patient@medvault.org", "Eleanor Vance");
        patientUser.setRoles(Set.of(patientRole));
        userRepository.save(patientUser);

        User patientUserEleanor = new User("user_eleanor", passwordEncoder.encode("patient123"), "eleanor.vance@example.com", "Eleanor Vance");
        patientUserEleanor.setRoles(Set.of(patientRole));
        userRepository.save(patientUserEleanor);

        User patientUserRobert = new User("user_robert", passwordEncoder.encode("patient123"), "robert.chen@example.com", "Robert Chen");
        patientUserRobert.setRoles(Set.of(patientRole));
        userRepository.save(patientUserRobert);

        User patientUserSophia = new User("user_sophia", passwordEncoder.encode("patient123"), "sophia.m@example.com", "Sophia Martinez");
        patientUserSophia.setRoles(Set.of(patientRole));
        userRepository.save(patientUserSophia);

        System.out.println("[DataSeeder] Phase 3: Creating patients...");
        // 3. Create Patients (Demographics & Identity)
        Patient p1 = new Patient();
        p1.setPatientCode("PAT-1001");
        p1.setSsn("459-00-1284");
        p1.setFullName("Eleanor Vance");
        p1.setDateOfBirth(LocalDate.of(1985, 4, 12));
        p1.setGender("Female");
        p1.setBloodType("O+");
        p1.setPhone("+1 (555) 234-5678");
        p1.setEmail("eleanor.vance@example.com");
        p1.setAddress("742 Evergreen Terrace, Springfield");
        p1.setEmergencyContact("Thomas Vance (Husband) - +1 (555) 987-6543");
        p1.setInsuranceProvider("BlueCross BlueShield");
        p1.setInsurancePolicyNumber("BCBS-9874102");
        p1.setInsuranceGroupNumber("GRP-55410");
        p1.setCoveragePlan("PPO Preferred Premier");
        p1.setMedicalAlerts("Type 2 Diabetes, Severe Penicillin Allergy, Mild Asthma");
        p1.setUser(patientUserEleanor);
        patientRepository.save(p1);

        Patient p2 = new Patient();
        p2.setPatientCode("PAT-1002");
        p2.setSsn("218-00-9831");
        p2.setFullName("Robert Chen");
        p2.setDateOfBirth(LocalDate.of(1972, 9, 28));
        p2.setGender("Male");
        p2.setBloodType("A+");
        p2.setPhone("+1 (555) 345-6789");
        p2.setEmail("robert.chen@example.com");
        p2.setAddress("1204 Pine Crest Ave, Seattle");
        p2.setEmergencyContact("Mei Chen (Wife) - +1 (555) 876-5432");
        p2.setInsuranceProvider("Aetna Health Choice");
        p2.setInsurancePolicyNumber("AET-5510923");
        p2.setInsuranceGroupNumber("GRP-11092");
        p2.setCoveragePlan("Choice POS II");
        p2.setMedicalAlerts("Essential Hypertension, Hyperlipidemia");
        p2.setUser(patientUserRobert);
        patientRepository.save(p2);

        Patient p3 = new Patient();
        p3.setPatientCode("PAT-1003");
        p3.setSsn("781-00-4491");
        p3.setFullName("Sophia Martinez");
        p3.setDateOfBirth(LocalDate.of(1996, 11, 5));
        p3.setGender("Female");
        p3.setBloodType("B-");
        p3.setPhone("+1 (555) 456-7890");
        p3.setEmail("sophia.m@example.com");
        p3.setAddress("45 Ocean View Blvd, Miami");
        p3.setEmergencyContact("Carlos Martinez (Father) - +1 (555) 765-4321");
        p3.setInsuranceProvider("UnitedHealthcare");
        p3.setInsurancePolicyNumber("UHC-7740192");
        p3.setInsuranceGroupNumber("GRP-88102");
        p3.setCoveragePlan("HMO Gold Select");
        p3.setMedicalAlerts("Latex Allergy");
        p3.setUser(patientUserSophia);
        patientRepository.save(p3);

        System.out.println("[DataSeeder] Phase 4: Creating encounters...");
        // 4. Create Encounters & Visits
        Encounter enc1 = new Encounter();
        enc1.setPatient(p1);
        enc1.setAttendingProvider(doctor);
        enc1.setEncounterType("OUTPATIENT");
        enc1.setChiefComplaint("Routine diabetes checkup and cardiovascular risk evaluation.");
        enc1.setClinicalNotes("Patient reports good dietary discipline. Blood pressure reading is 128/82. HbA1c is 6.8%.");
        enc1.setDischargeSummary("Continue current Metformin therapy. Follow up in 90 days.");
        enc1.setStatus("COMPLETED");
        enc1.setEncounterDate(LocalDateTime.now().minusDays(14));
        encounterRepository.save(enc1);

        Encounter enc2 = new Encounter();
        enc2.setPatient(p2);
        enc2.setAttendingProvider(doctor);
        enc2.setEncounterType("EMERGENCY");
        enc2.setChiefComplaint("Acute morning headache and elevated home blood pressure (155/95).");
        enc2.setClinicalNotes("Evaluated in ED. ECG shows normal sinus rhythm. Administered Lisinopril orally.");
        enc2.setDischargeSummary("Discharged with prescription for Lisinopril 10mg daily and primary care follow-up.");
        enc2.setStatus("DISCHARGED");
        enc2.setEncounterDate(LocalDateTime.now().minusDays(3));
        encounterRepository.save(enc2);

        Encounter enc3 = new Encounter();
        enc3.setPatient(p3);
        enc3.setAttendingProvider(doctor);
        enc3.setEncounterType("TELEHEALTH");
        enc3.setChiefComplaint("Follow-up for latex allergy reaction");
        enc3.setClinicalNotes("Patient reports mild rash after using latex gloves.");
        enc3.setDischargeSummary("Avoid latex products. Prescribed antihistamine.");
        enc3.setStatus("COMPLETED");
        enc3.setEncounterDate(LocalDateTime.now().minusDays(1));
        encounterRepository.save(enc3);

        System.out.println("[DataSeeder] Phase 5: Creating allergies...");
        // 5. Create Coded Allergies & Contraindications
        Allergy a1 = new Allergy();
        a1.setPatient(p1);
        a1.setAllergenName("Penicillin");
        a1.setAllergenCode("RxNorm-70618");
        a1.setCategory("DRUG");
        a1.setSeverity("SEVERE");
        a1.setReactionDescription("Anaphylaxis, acute bronchial constriction, severe hives.");
        a1.setStatus("ACTIVE");
        a1.setRecordedBy(doctor);
        a1.setRecordedAt(LocalDateTime.now().minusDays(60));
        allergyRepository.save(a1);

        Allergy a2 = new Allergy();
        a2.setPatient(p3);
        a2.setAllergenName("Latex");
        a2.setAllergenCode("SNOMED-300916003");
        a2.setCategory("ENVIRONMENTAL");
        a2.setSeverity("MODERATE");
        a2.setReactionDescription("Contact dermatitis and localized pruritus.");
        a2.setStatus("ACTIVE");
        a2.setRecordedBy(nurse);
        allergyRepository.save(a2);

        System.out.println("[DataSeeder] Phase 6: Creating diagnoses...");
        // 6. Create Coded Diagnoses & Problem Lists
        Diagnosis d1 = new Diagnosis();
        d1.setPatient(p1);
        d1.setDoctor(doctor);
        d1.setConditionName("Type 2 Diabetes Mellitus without complications");
        d1.setIcdCode("E11.9");
        d1.setSnomedCode("44054006");
        d1.setOnsetDate(LocalDate.of(2020, 3, 15));
        d1.setStatus("CHRONIC");
        d1.setNotes("Managed with oral antihyperglycemic agents and quarterly glycemic monitoring.");
        diagnosisRepository.save(d1);

        Diagnosis d2 = new Diagnosis();
        d2.setPatient(p2);
        d2.setDoctor(doctor);
        d2.setConditionName("Essential (Primary) Hypertension");
        d2.setIcdCode("I10");
        d2.setSnomedCode("59621000");
        d2.setOnsetDate(LocalDate.of(2021, 8, 10));
        d2.setStatus("ACTIVE");
        d2.setNotes("Baseline blood pressure controlled with ACE inhibitor therapy.");
        diagnosisRepository.save(d2);

        Diagnosis d3 = new Diagnosis();
        d3.setPatient(p3);
        d3.setDoctor(doctor);
        d3.setConditionName("Contact Dermatitis");
        d3.setIcdCode("L23.8");
        d3.setSnomedCode("4022007");
        d3.setOnsetDate(LocalDate.now().minusDays(2));
        d3.setStatus("ACTIVE");
        d3.setNotes("Allergic reaction to latex exposure.");
        diagnosisRepository.save(d3);

        System.out.println("[DataSeeder] Phase 7: Creating medical records...");
        // 7. Create Medical Records
        MedicalRecord mr1 = new MedicalRecord();
        mr1.setPatient(p1);
        mr1.setDoctor(doctor);
        mr1.setDiagnosis("Routine Cardiac Follow-up & Glycemic Assessment");
        mr1.setIcdCode("E11.9");
        mr1.setSymptoms("Mild fatigue, occasional shortness of breath after climbing stairs.");
        mr1.setTreatmentPlan("Continue Metformin 500mg. Start daily 30-min walking routine. Follow up in 3 months.");
        mr1.setNotes("Patient reports good compliance with diet. Blood pressure slightly elevated.");
        recordRepository.save(mr1);

        MedicalRecord mr2 = new MedicalRecord();
        mr2.setPatient(p2);
        mr2.setDoctor(doctor);
        mr2.setDiagnosis("Hypertension Management");
        mr2.setIcdCode("I10");
        mr2.setSymptoms("Occasional morning headaches.");
        mr2.setTreatmentPlan("Continue Lisinopril. Monitor BP daily.");
        mr2.setNotes("BP is stable on current medication.");
        recordRepository.save(mr2);

        System.out.println("[DataSeeder] Phase 8: Creating vitals...");
        // 8. Create Longitudinal Time-Series Vitals
        Vitals v1_1 = new Vitals();
        v1_1.setPatient(p1);
        v1_1.setRecordedBy(nurse);
        v1_1.setBloodPressure("134/86");
        v1_1.setHeartRate(78);
        v1_1.setTemperature(36.7);
        v1_1.setOxygenSaturation(98);
        v1_1.setRespiratoryRate(16);
        v1_1.setHeightCm(165.0);
        v1_1.setWeightKg(70.0);
        v1_1.setBloodGlucose(135);
        v1_1.setRecordedAt(LocalDateTime.now().minusDays(30));
        vitalsRepository.save(v1_1);

        Vitals v1_2 = new Vitals();
        v1_2.setPatient(p1);
        v1_2.setRecordedBy(nurse);
        v1_2.setBloodPressure("128/82");
        v1_2.setHeartRate(74);
        v1_2.setTemperature(36.8);
        v1_2.setOxygenSaturation(98);
        v1_2.setRespiratoryRate(16);
        v1_2.setHeightCm(165.0);
        v1_2.setWeightKg(68.5);
        v1_2.setBloodGlucose(118);
        v1_2.setRecordedAt(LocalDateTime.now().minusDays(14));
        vitalsRepository.save(v1_2);

        Vitals v2_1 = new Vitals();
        v2_1.setPatient(p2);
        v2_1.setRecordedBy(nurse);
        v2_1.setBloodPressure("142/90");
        v2_1.setHeartRate(85);
        v2_1.setTemperature(37.1);
        v2_1.setOxygenSaturation(97);
        v2_1.setRespiratoryRate(18);
        v2_1.setHeightCm(178.0);
        v2_1.setWeightKg(86.0);
        v2_1.setBloodGlucose(105);
        v2_1.setRecordedAt(LocalDateTime.now().minusDays(10));
        vitalsRepository.save(v2_1);

        Vitals v2_2 = new Vitals();
        v2_2.setPatient(p2);
        v2_2.setRecordedBy(nurse);
        v2_2.setBloodPressure("130/84");
        v2_2.setHeartRate(78);
        v2_2.setTemperature(36.9);
        v2_2.setOxygenSaturation(98);
        v2_2.setRespiratoryRate(16);
        v2_2.setHeightCm(178.0);
        v2_2.setWeightKg(84.5);
        v2_2.setBloodGlucose(98);
        v2_2.setRecordedAt(LocalDateTime.now().minusDays(3));
        vitalsRepository.save(v2_2);

        Vitals v3_1 = new Vitals();
        v3_1.setPatient(p3);
        v3_1.setRecordedBy(nurse);
        v3_1.setBloodPressure("110/70");
        v3_1.setHeartRate(72);
        v3_1.setTemperature(36.6);
        v3_1.setOxygenSaturation(99);
        v3_1.setRespiratoryRate(14);
        v3_1.setHeightCm(160.0);
        v3_1.setWeightKg(55.0);
        v3_1.setRecordedAt(LocalDateTime.now().minusDays(5));
        vitalsRepository.save(v3_1);

        Vitals v3_2 = new Vitals();
        v3_2.setPatient(p3);
        v3_2.setRecordedBy(nurse);
        v3_2.setBloodPressure("112/72");
        v3_2.setHeartRate(74);
        v3_2.setTemperature(36.7);
        v3_2.setOxygenSaturation(98);
        v3_2.setRespiratoryRate(14);
        v3_2.setHeightCm(160.0);
        v3_2.setWeightKg(55.0);
        v3_2.setRecordedAt(LocalDateTime.now().minusDays(2));
        vitalsRepository.save(v3_2);

        Vitals v3_3 = new Vitals();
        v3_3.setPatient(p3);
        v3_3.setRecordedBy(nurse);
        v3_3.setBloodPressure("115/75");
        v3_3.setHeartRate(75);
        v3_3.setTemperature(36.8);
        v3_3.setOxygenSaturation(99);
        v3_3.setRespiratoryRate(15);
        v3_3.setHeightCm(160.0);
        v3_3.setWeightKg(55.0);
        v3_3.setRecordedAt(LocalDateTime.now());
        vitalsRepository.save(v3_3);

        System.out.println("[DataSeeder] Phase 9: Creating prescriptions...");
        // 9. Create Prescriptions
        Prescription rx1 = new Prescription();
        rx1.setPatient(p1);
        rx1.setDoctor(doctor);
        rx1.setMedicationName("Metformin HCl");
        rx1.setRxNormCode("6809");
        rx1.setDosage("500 mg");
        rx1.setRoute("Oral");
        rx1.setFrequency("Twice daily with meals");
        rx1.setDurationDays(90);
        rx1.setRefills(3);
        rx1.setInstructions("Take after morning and evening meals with a full glass of water.");
        rx1.setStatus("ACTIVE");
        prescriptionRepository.save(rx1);

        Prescription rx2 = new Prescription();
        rx2.setPatient(p2);
        rx2.setDoctor(doctor);
        rx2.setMedicationName("Lisinopril");
        rx2.setRxNormCode("29046");
        rx2.setDosage("10 mg");
        rx2.setRoute("Oral");
        rx2.setFrequency("Once daily in the morning");
        rx2.setDurationDays(30);
        rx2.setRefills(2);
        rx2.setInstructions("Monitor BP weekly.");
        rx2.setStatus("ACTIVE");
        prescriptionRepository.save(rx2);

        Prescription rx3 = new Prescription();
        rx3.setPatient(p3);
        rx3.setDoctor(doctor);
        rx3.setMedicationName("Hydroxyzine");
        rx3.setRxNormCode("3423");
        rx3.setDosage("25 mg");
        rx3.setRoute("Oral");
        rx3.setFrequency("As needed for allergic reaction");
        rx3.setDurationDays(14);
        rx3.setRefills(1);
        rx3.setInstructions("Take 1 tablet every 6 hours as needed.");
        rx3.setStatus("ACTIVE");
        prescriptionRepository.save(rx3);

        System.out.println("[DataSeeder] Phase 10: Creating appointments...");
        // 10. Create Appointments
        Appointment apt1 = new Appointment();
        apt1.setPatient(p1);
        apt1.setDoctor(doctor);
        apt1.setAppointmentDate(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0));
        apt1.setReason("3-Month Diabetes & Cardiology Review");
        apt1.setStatus("SCHEDULED");
        apt1.setNotes("Patient requested morning slot.");
        appointmentRepository.save(apt1);

        Appointment apt2 = new Appointment();
        apt2.setPatient(p2);
        apt2.setDoctor(doctor);
        apt2.setAppointmentDate(LocalDateTime.now().plusDays(5).withHour(14).withMinute(30));
        apt2.setReason("Hypertension Follow-up");
        apt2.setStatus("SCHEDULED");
        appointmentRepository.save(apt2);

        Appointment apt3 = new Appointment();
        apt3.setPatient(p3);
        apt3.setDoctor(doctor);
        apt3.setAppointmentDate(LocalDateTime.now().plusDays(7).withHour(11).withMinute(0));
        apt3.setReason("Allergy Consult");
        apt3.setStatus("SCHEDULED");
        appointmentRepository.save(apt3);

        System.out.println("[DataSeeder] Phase 11: Creating audit logs...");
        // 11. Create Immutable Audit Ledger Entries
        auditLogRepository.save(new AuditLog("SYSTEM", "SYSTEM", "SEED", "DATABASE", "0", "Initialized MedVault EHR database with 7 sub-domain schemas and FHIR R4 synthetic cohorts."));
        auditLogRepository.save(new AuditLog("admin", "ROLE_ADMIN", "CREATE", "USER", "1", "Provisioned RBAC clinical access credentials for Dr. Sarah Jenkins, Nurse Clara Barton, and Auditor Vance."));
        auditLogRepository.save(new AuditLog("doctor", "ROLE_DOCTOR", "CREATE", "ALLERGY", String.valueOf(a1.getId()), "Documented SEVERE Penicillin allergy (RxNorm-70618) for patient PAT-1001."));
        auditLogRepository.save(new AuditLog("auditor", "ROLE_AUDITOR", "READ", "AUDIT_LEDGER", "ALL", "Executed HIPAA § 164.312(b) compliance forensic audit review."));
        auditLogRepository.save(new AuditLog("doctor", "ROLE_DOCTOR", "CREATE", "PRESCRIPTION", String.valueOf(rx3.getId()), "Prescribed Hydroxyzine for patient PAT-1003."));
        auditLogRepository.save(new AuditLog("nurse", "ROLE_NURSE", "CREATE", "VITALS", "ALL", "Recorded vitals for patient PAT-1003."));
        auditLogRepository.save(new AuditLog("doctor", "ROLE_DOCTOR", "CREATE", "DIAGNOSIS", String.valueOf(d3.getId()), "Logged Contact Dermatitis diagnosis for patient PAT-1003."));
        auditLogRepository.save(new AuditLog("doctor", "ROLE_DOCTOR", "CREATE", "ENCOUNTER", String.valueOf(enc3.getId()), "Logged TELEHEALTH encounter for patient PAT-1003."));

        long userCount = userRepository.count();
        long patientCount = patientRepository.count();
        long encounterCount = encounterRepository.count();
        
        System.out.println(String.format("[DataSeeder] ✓ MedVault EHR database seeded successfully with %d users, %d patients, %d encounters...", userCount, patientCount, encounterCount));
    }
}
