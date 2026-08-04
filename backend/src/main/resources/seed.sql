-- ==============================================================================
-- MedVault EHR Database Seed Script
-- Compatible with Database SQL Editors (H2, PostgreSQL, MySQL, Oracle, etc.)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ROLES
-- ------------------------------------------------------------------------------
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_DOCTOR');
INSERT INTO roles (id, name) VALUES (3, 'ROLE_NURSE');
INSERT INTO roles (id, name) VALUES (4, 'ROLE_AUDITOR');
INSERT INTO roles (id, name) VALUES (5, 'ROLE_PATIENT');
INSERT INTO roles (id, name) VALUES (6, 'ROLE_RECEPTIONIST');

-- ------------------------------------------------------------------------------
-- 2. USERS
-- Default Login Passwords:
-- Admin: admin / admin123
-- Receptionist: receptionist / receptionist123
-- Doctors: doctor (or doctor_mahtab, doctor_rajesh) / doctor123
-- Nurse: nurse (or nurse_priya) / nurse123
-- Auditor: auditor / auditor123
-- Patient: patient (or user_kamran, user_aarav, user_ananya) / patient123
-- ------------------------------------------------------------------------------
INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (1, 'admin', '$2a$10$rIxvNrZcsreC0tp5Ik9S4uFff/IyrYl3eiLHyH53l6IyuM5jHY67C', 'admin@medvault.org', 'Dr. Vikramaditya Gupta (Admin/Intake)', NULL, 'Patient Intake & Administration', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (2, 'doctor', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'doctor@medvault.org', 'Dr. Mahtab Khan', 'Cardiology & Internal Medicine', 'Cardiovascular Medicine', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (3, 'doctor_mahtab', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'mahtab.khan@medvault.org', 'Dr. Mahtab Khan', 'Cardiology & Internal Medicine', 'Cardiovascular Medicine', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (4, 'doctor_rajesh', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'rajesh.sharma@medvault.org', 'Dr. Rajesh Sharma', 'Neurology & Internal Medicine', 'Neurological Sciences', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (5, 'nurse', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'nurse@medvault.org', 'Nurse Priya Verma', NULL, 'Emergency / ICU Bedside', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (6, 'nurse_priya', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'priya.verma@medvault.org', 'Nurse Priya Verma', NULL, 'Emergency / ICU Bedside', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (7, 'auditor', '$2a$10$3Uj7vg0rhOtYROAzLYvK2.HbXLWJfNM4lfK8DNWsGCsEHLH14A3ei', 'auditor@medvault.org', 'Inspector Suresh Menon (Compliance Auditor)', NULL, 'Regulatory Compliance & Forensics', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (8, 'patient', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'patient@medvault.org', 'Kamran Khan', NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (9, 'user_kamran', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'kamran.khan@example.com', 'Kamran Khan', NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (10, 'user_aarav', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'aarav.patel@example.com', 'Aarav Patel', NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (11, 'user_ananya', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'ananya.sharma@example.com', 'Ananya Sharma', NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (12, 'user_rohan', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'rohan.mehta@example.com', 'Rohan Mehta', NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (13, 'receptionist', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'receptionist@medvault.org', 'Receptionist Sarita Verma', NULL, 'Patient Intake & Reception Desk', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 3. USER ROLES (JOIN TABLE)
-- ------------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (3, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (4, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (5, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (6, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (7, 4);
INSERT INTO user_roles (user_id, role_id) VALUES (8, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (9, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (10, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (11, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (12, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (13, 6);


-- ------------------------------------------------------------------------------
-- 4. PATIENTS
-- ------------------------------------------------------------------------------
INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (1, 'PAT-1001', '459-00-1284', 'Kamran Khan', '1985-04-12', 'Male', 'O+', '+91 98765 43210', 'patient@medvault.org', '742 Marine Drive, Mumbai', 'Farah Khan (Wife) - +91 98765 98765', 'Star Health Insurance', 'STAR-9874102', 'GRP-55410', 'Premier Comprehensive Care', 'Type 2 Diabetes, Severe Penicillin Allergy, Mild Asthma', 8, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (2, 'PAT-1002', '218-00-9831', 'Aarav Patel', '1972-09-28', 'Male', 'A+', '+91 98765 12345', 'aarav.patel@example.com', '1204 CG Road, Ahmedabad', 'Priya Patel (Wife) - +91 98765 87654', 'HDFC ERGO Health', 'HDFC-5510923', 'GRP-11092', 'Optima Secure', 'Essential Hypertension, Hyperlipidemia', 10, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (3, 'PAT-1003', '781-00-4491', 'Ananya Sharma', '1996-11-05', 'Female', 'B-', '+91 98765 67890', 'ananya.sharma@example.com', '45 Park Street, Kolkata', 'Rajesh Sharma (Father) - +91 98765 76543', 'ICICI Lombard', 'ICI-7740192', 'GRP-88102', 'Health Shield Gold', 'Latex Allergy', 11, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (4, 'PAT-1004', '312-00-5582', 'Rohan Mehta', '1990-07-22', 'Male', 'AB+', '+91 98765 88990', 'rohan.mehta@example.com', '88 Bandra Reclamation, Mumbai', 'Neha Mehta (Sister) - +91 98765 11223', 'Care Health Insurance', 'CARE-3341029', 'GRP-99401', 'Super Mediclaim', 'Peanut Allergy', 12, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 5. ENCOUNTERS
-- ------------------------------------------------------------------------------
INSERT INTO encounters (id, patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status, encounter_date)
VALUES (1, 1, 2, 'OUTPATIENT', 'Routine diabetes checkup and cardiovascular risk evaluation.', 'Patient reports good dietary discipline. Blood pressure reading is 128/82. HbA1c is 6.8%.', 'Continue current Metformin therapy. Follow up in 90 days.', 'COMPLETED', CURRENT_TIMESTAMP);

INSERT INTO encounters (id, patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status, encounter_date)
VALUES (2, 2, 2, 'EMERGENCY', 'Acute morning headache and elevated home blood pressure (155/95).', 'Evaluated in ED. ECG shows normal sinus rhythm. Administered Lisinopril orally.', 'Discharged with prescription for Lisinopril 10mg daily and primary care follow-up.', 'DISCHARGED', CURRENT_TIMESTAMP);

INSERT INTO encounters (id, patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status, encounter_date)
VALUES (3, 3, 2, 'TELEHEALTH', 'Follow-up for latex allergy reaction', 'Patient reports mild rash after using latex gloves.', 'Avoid latex products. Prescribed antihistamine.', 'COMPLETED', CURRENT_TIMESTAMP);

INSERT INTO encounters (id, patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status, encounter_date)
VALUES (4, 4, 4, 'OUTPATIENT', 'Annual physical and neurological screening.', 'Neurological exam normal. Cranial nerves II-XII intact. DTRs 2+ bilaterally.', 'Screening completed without abnormalities.', 'COMPLETED', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 6. ALLERGIES
-- ------------------------------------------------------------------------------
INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (1, 1, 'Penicillin', 'RxNorm-70618', 'DRUG', 'SEVERE', 'Anaphylaxis, acute bronchial constriction, severe hives.', 'ACTIVE', 2, CURRENT_TIMESTAMP);

INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (2, 3, 'Latex', 'SNOMED-300916003', 'ENVIRONMENTAL', 'MODERATE', 'Contact dermatitis and localized pruritus.', 'ACTIVE', 5, CURRENT_TIMESTAMP);

INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (3, 4, 'Peanuts', 'SNOMED-91935009', 'FOOD', 'SEVERE', 'Facial swelling and dyspnea upon exposure.', 'ACTIVE', 2, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 7. DIAGNOSES
-- ------------------------------------------------------------------------------
INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes, recorded_at)
VALUES (1, 1, 2, 'Type 2 Diabetes Mellitus without complications', 'E11.9', '44054006', '2020-03-15', 'CHRONIC', 'Managed with oral antihyperglycemic agents and quarterly glycemic monitoring.', CURRENT_TIMESTAMP);

INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes, recorded_at)
VALUES (2, 2, 2, 'Essential (Primary) Hypertension', 'I10', '59621000', '2021-08-10', 'ACTIVE', 'Baseline blood pressure controlled with ACE inhibitor therapy.', CURRENT_TIMESTAMP);

INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes, recorded_at)
VALUES (3, 3, 2, 'Contact Dermatitis', 'L23.8', '4022007', '2026-07-30', 'ACTIVE', 'Allergic reaction to latex exposure.', CURRENT_TIMESTAMP);

INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes, recorded_at)
VALUES (4, 4, 4, 'Tension Headache', 'G44.2', '398057008', '2025-11-12', 'RESOLVED', 'Stress-related tension headaches, resolved after lifestyle modifications.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 8. MEDICAL RECORDS
-- ------------------------------------------------------------------------------
INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (1, 1, 2, 'Routine Cardiac Follow-up & Glycemic Assessment', 'E11.9', 'Mild fatigue, occasional shortness of breath after climbing stairs.', 'Continue Metformin 500mg. Start daily 30-min walking routine. Follow up in 3 months.', 'Patient reports good compliance with diet. Blood pressure slightly elevated.', CURRENT_TIMESTAMP);

INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (2, 2, 2, 'Hypertension Management', 'I10', 'Occasional morning headaches.', 'Continue Lisinopril. Monitor BP daily.', 'BP is stable on current medication.', CURRENT_TIMESTAMP);

INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (3, 4, 4, 'Annual Neurological Check', 'Z00.00', 'None reported.', 'Maintain regular physical exercise and sleep hygiene.', 'All vitals and reflex responses within optimal baseline parameters.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 9. VITALS
-- ------------------------------------------------------------------------------
INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (1, 1, 5, '134/86', 78, 36.7, 98, 16, 70.0, 165.0, 25.7, 135, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (2, 1, 5, '128/82', 74, 36.8, 98, 16, 68.5, 165.0, 25.2, 118, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (3, 2, 5, '142/90', 85, 37.1, 97, 18, 86.0, 178.0, 27.1, 105, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (4, 2, 5, '130/84', 78, 36.9, 98, 16, 84.5, 178.0, 26.7, 98, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (5, 3, 5, '110/70', 72, 36.6, 99, 14, 55.0, 160.0, 21.5, NULL, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (6, 3, 5, '112/72', 74, 36.7, 98, 14, 55.0, 160.0, 21.5, NULL, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (7, 3, 5, '115/75', 75, 36.8, 99, 15, 55.0, 160.0, 21.5, NULL, CURRENT_TIMESTAMP);

INSERT INTO vitals (id, patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at)
VALUES (8, 4, 5, '120/78', 70, 36.6, 99, 15, 75.0, 175.0, 24.5, 92, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 10. PRESCRIPTIONS
-- ------------------------------------------------------------------------------
INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status, prescribed_at)
VALUES (1, 1, 2, 'Metformin HCl', '6809', '500 mg', 'Oral', 'Twice daily with meals', 90, 3, 'Take after morning and evening meals with a full glass of water.', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status, prescribed_at)
VALUES (2, 2, 2, 'Lisinopril', '29046', '10 mg', 'Oral', 'Once daily in the morning', 30, 2, 'Monitor BP weekly.', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status, prescribed_at)
VALUES (3, 3, 2, 'Hydroxyzine', '3423', '25 mg', 'Oral', 'As needed for allergic reaction', 14, 1, 'Take 1 tablet every 6 hours as needed.', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status, prescribed_at)
VALUES (4, 4, 4, 'EpiPen Auto-Injector', '314684', '0.3 mg', 'Intramuscular', 'As needed for severe allergic reaction', 365, 2, 'Use immediately upon accidental peanut exposure and call emergency services.', 'ACTIVE', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 11. APPOINTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, reason, notes, created_at)
VALUES (1, 1, 2, '2026-08-04 10:00:00', 'SCHEDULED', '3-Month Diabetes & Cardiology Review', 'Patient requested morning slot.', CURRENT_TIMESTAMP);

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, reason, notes, created_at)
VALUES (2, 2, 2, '2026-08-06 14:30:00', 'SCHEDULED', 'Hypertension Follow-up', NULL, CURRENT_TIMESTAMP);

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, reason, notes, created_at)
VALUES (3, 3, 2, '2026-08-08 11:00:00', 'SCHEDULED', 'Allergy Consult', NULL, CURRENT_TIMESTAMP);

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, reason, notes, created_at)
VALUES (4, 4, 4, '2026-08-10 15:00:00', 'SCHEDULED', 'Neurology Routine Review', 'Annual follow up.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------
-- 12. AUDIT LOGS
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (1, 'SYSTEM', 'SYSTEM', 'SEED', 'DATABASE', '0', '127.0.0.1', 'Initialized MedVault EHR database via manual SQL seed script.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (2, 'admin', 'ROLE_ADMIN', 'CREATE', 'USER', '1', '127.0.0.1', 'Provisioned RBAC clinical access credentials for Dr. Mahtab Khan, Nurse Priya Verma, and Inspector Suresh Menon.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (3, 'doctor', 'ROLE_DOCTOR', 'CREATE', 'ALLERGY', '1', '127.0.0.1', 'Documented SEVERE Penicillin allergy (RxNorm-70618) for patient PAT-1001.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (4, 'auditor', 'ROLE_AUDITOR', 'READ', 'AUDIT_LEDGER', 'ALL', '127.0.0.1', 'Executed HIPAA § 164.312(b) compliance forensic audit review.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (5, 'doctor', 'ROLE_DOCTOR', 'CREATE', 'PRESCRIPTION', '3', '127.0.0.1', 'Prescribed Hydroxyzine for patient PAT-1003.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (6, 'nurse', 'ROLE_NURSE', 'CREATE', 'VITALS', 'ALL', '127.0.0.1', 'Recorded vitals for patient PAT-1003.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (7, 'doctor', 'ROLE_DOCTOR', 'CREATE', 'DIAGNOSIS', '3', '127.0.0.1', 'Logged Contact Dermatitis diagnosis for patient PAT-1003.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (8, 'doctor', 'ROLE_DOCTOR', 'CREATE', 'ENCOUNTER', '3', '127.0.0.1', 'Logged TELEHEALTH encounter for patient PAT-1003.', CURRENT_TIMESTAMP);

ALTER TABLE roles ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE users ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE patients ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE encounters ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE allergies ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE diagnoses ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE medical_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE vitals ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE prescriptions ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 3000;
