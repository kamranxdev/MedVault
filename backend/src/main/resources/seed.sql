-- ==============================================================================
-- MedVault EHR Database Seed Script
-- Compatible with Database SQL Editors (H2, PostgreSQL, MySQL, Oracle, etc.)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO departments (id, name, code, description) VALUES (1, 'Cardiovascular Medicine', 'CARD', 'Cardiology, ECG, Heart Failure, Echocardiography');
INSERT INTO departments (id, name, code, description) VALUES (2, 'Emergency & Acute Care', 'EMG', 'Emergency Department, Triage, ICU Bedside');
INSERT INTO departments (id, name, code, description) VALUES (3, 'Patient Intake & Reception Desk', 'REC', 'Front Desk, Patient Registration, Appointment Scheduling');
INSERT INTO departments (id, name, code, description) VALUES (4, 'Clinical Pathology & Laboratory', 'LAB', 'Diagnostic Specimen Processing & Hematology');
INSERT INTO departments (id, name, code, description) VALUES (5, 'Clinical Pharmacy Services', 'PHARM', 'Medication Reconciliation, eRx Verification, Dispensing');
INSERT INTO departments (id, name, code, description) VALUES (6, 'Revenue Cycle & Patient Billing', 'BILL', 'Invoicing, Insurance Claims, Financial Audits');
INSERT INTO departments (id, name, code, description) VALUES (7, 'Platform Administration & Security', 'ADM', 'System Infrastructure & Security Governance');
INSERT INTO departments (id, name, code, description) VALUES (8, 'Regulatory Compliance & Forensics', 'AUD', 'HIPAA § 164.312 Compliance & WORM Audits');

-- ------------------------------------------------------------------------------
-- 2. ROLES (10 Baseline Production Roles + Legacy Alias)
-- ------------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES (1, 'ROLE_SYS_ADMIN', 'Platform System Administrator - Tenant Infrastructure & Security');
INSERT INTO roles (id, name, description) VALUES (2, 'ROLE_ORG_ADMIN', 'Organization Administrator - Clinic Facilities & Staff Roster');
INSERT INTO roles (id, name, description) VALUES (3, 'ROLE_DOCTOR', 'Physician / Attending Doctor - Diagnoses, Notes, eRx Orders');
INSERT INTO roles (id, name, description) VALUES (4, 'ROLE_NURSE', 'Registered Nurse - Triage, Vitals, MAR Administration');
INSERT INTO roles (id, name, description) VALUES (5, 'ROLE_RECEPTIONIST', 'Receptionist - Front Desk Intake, Scheduling, Demographics');
INSERT INTO roles (id, name, description) VALUES (6, 'ROLE_LAB_TECH', 'Laboratory Technician - Specimen Processing & Lab Results');
INSERT INTO roles (id, name, description) VALUES (7, 'ROLE_PHARMACIST', 'Pharmacist - Medication Reconciliation & Dispensing');
INSERT INTO roles (id, name, description) VALUES (8, 'ROLE_BILLING', 'Billing Officer - Revenue Cycle, Invoices, Claims');
INSERT INTO roles (id, name, description) VALUES (9, 'ROLE_PATIENT', 'Patient - Personal Health Portal Access');
INSERT INTO roles (id, name, description) VALUES (10, 'ROLE_AUDITOR', 'Compliance Officer - WORM Audit Log & Access Reports');
INSERT INTO roles (id, name, description) VALUES (11, 'ROLE_ADMIN', 'Legacy Admin Alias');

-- ------------------------------------------------------------------------------
-- 3. PERMISSIONS
-- ------------------------------------------------------------------------------
INSERT INTO permissions (id, code, category, description) VALUES (1, 'PATIENT_CREATE', 'PATIENT', 'Create new patient profile in MPI');
INSERT INTO permissions (id, code, category, description) VALUES (2, 'PATIENT_READ', 'PATIENT', 'View patient demographic details');
INSERT INTO permissions (id, code, category, description) VALUES (3, 'PATIENT_UPDATE', 'PATIENT', 'Update patient demographic fields');
INSERT INTO permissions (id, code, category, description) VALUES (4, 'APPOINTMENT_CREATE', 'APPOINTMENT', 'Schedule new patient appointment');
INSERT INTO permissions (id, code, category, description) VALUES (5, 'APPOINTMENT_READ', 'APPOINTMENT', 'View appointment calendar');
INSERT INTO permissions (id, code, category, description) VALUES (6, 'APPOINTMENT_UPDATE', 'APPOINTMENT', 'Reschedule or update appointment');
INSERT INTO permissions (id, code, category, description) VALUES (7, 'APPOINTMENT_CANCEL', 'APPOINTMENT', 'Cancel scheduled appointment');
INSERT INTO permissions (id, code, category, description) VALUES (8, 'CLINICAL_NOTE_CREATE', 'CLINICAL', 'Write SOAP progress notes');
INSERT INTO permissions (id, code, category, description) VALUES (9, 'CLINICAL_NOTE_READ', 'CLINICAL', 'Read SOAP progress notes');
INSERT INTO permissions (id, code, category, description) VALUES (10, 'DIAGNOSIS_CREATE', 'CLINICAL', 'Log ICD-10/SNOMED diagnosis');
INSERT INTO permissions (id, code, category, description) VALUES (11, 'DIAGNOSIS_READ', 'CLINICAL', 'View patient problem list');
INSERT INTO permissions (id, code, category, description) VALUES (12, 'VITALS_CREATE', 'CLINICAL', 'Record patient vital signs');
INSERT INTO permissions (id, code, category, description) VALUES (13, 'VITALS_READ', 'CLINICAL', 'View vitals flowsheet');
INSERT INTO permissions (id, code, category, description) VALUES (14, 'PRESCRIPTION_CREATE', 'MEDICATION', 'Issue RxNorm eRx prescription');
INSERT INTO permissions (id, code, category, description) VALUES (15, 'PRESCRIPTION_READ', 'MEDICATION', 'View prescription history');
INSERT INTO permissions (id, code, category, description) VALUES (16, 'MEDICATION_DISPENSE', 'MEDICATION', 'Dispense prescription order');
INSERT INTO permissions (id, code, category, description) VALUES (17, 'LAB_ORDER_CREATE', 'LABORATORY', 'Order diagnostic lab test');
INSERT INTO permissions (id, code, category, description) VALUES (18, 'LAB_RESULT_CREATE', 'LABORATORY', 'Enter diagnostic lab results');
INSERT INTO permissions (id, code, category, description) VALUES (19, 'LAB_RESULT_READ', 'LABORATORY', 'View lab result reports');
INSERT INTO permissions (id, code, category, description) VALUES (20, 'INVOICE_CREATE', 'BILLING', 'Generate patient invoice');
INSERT INTO permissions (id, code, category, description) VALUES (21, 'INVOICE_READ', 'BILLING', 'View financial billing invoices');
INSERT INTO permissions (id, code, category, description) VALUES (22, 'AUDIT_LOG_READ', 'SYSTEM', 'Read HIPAA WORM audit log');
INSERT INTO permissions (id, code, category, description) VALUES (23, 'USER_CREATE', 'SYSTEM', 'Provision new staff user');

-- ------------------------------------------------------------------------------
-- 4. ROLE_PERMISSIONS MAPPING
-- ------------------------------------------------------------------------------
-- Doctor (ROLE_DOCTOR): Full Clinical
INSERT INTO role_permissions (role_id, permission_id) VALUES (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13), (3, 14), (3, 15), (3, 17), (3, 19);

-- Nurse (ROLE_NURSE): Triage, Vitals, MAR, Notes Read
INSERT INTO role_permissions (role_id, permission_id) VALUES (4, 1), (4, 2), (4, 4), (4, 5), (4, 6), (4, 9), (4, 11), (4, 12), (4, 13), (4, 15), (4, 19);

-- Receptionist (ROLE_RECEPTIONIST): Demographics & Appointments
INSERT INTO role_permissions (role_id, permission_id) VALUES (5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 21);

-- Lab Tech (ROLE_LAB_TECH): Specimen & Lab Results
INSERT INTO role_permissions (role_id, permission_id) VALUES (6, 2), (6, 5), (6, 18), (6, 19);

-- Pharmacist (ROLE_PHARMACIST): eRx Review & Dispensing
INSERT INTO role_permissions (role_id, permission_id) VALUES (7, 2), (7, 15), (7, 16);

-- Billing Officer (ROLE_BILLING): Invoices & Revenue Cycle
INSERT INTO role_permissions (role_id, permission_id) VALUES (8, 2), (8, 20), (8, 21);

-- Patient (ROLE_PATIENT): Personal Self-Service
INSERT INTO role_permissions (role_id, permission_id) VALUES (9, 2), (9, 5), (9, 9), (9, 11), (9, 13), (9, 15), (9, 19), (9, 21);

-- Auditor (ROLE_AUDITOR): Read-only Compliance
INSERT INTO role_permissions (role_id, permission_id) VALUES (10, 2), (10, 5), (10, 9), (10, 11), (10, 13), (10, 15), (10, 19), (10, 21), (10, 22);

-- System Admin (ROLE_SYS_ADMIN) & Org Admin (ROLE_ORG_ADMIN): All
INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions;
INSERT INTO role_permissions (role_id, permission_id) SELECT 2, id FROM permissions;
INSERT INTO role_permissions (role_id, permission_id) SELECT 11, id FROM permissions;

-- ------------------------------------------------------------------------------
-- 5. USERS
-- Default Login Passwords:
-- Admin: admin / admin123
-- Receptionist: receptionist / receptionist123
-- Doctors: doctor (or doctor_mahtab, doctor_rajesh) / doctor123
-- Nurse: nurse (or nurse_priya) / nurse123
-- Lab Tech: labtech / labtech123
-- Pharmacist: pharmacist / pharmacist123
-- Billing: billing / billing123
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
VALUES (5, 'nurse', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'nurse@medvault.org', 'Nurse Priya Verma', NULL, 'Emergency & Acute Care', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (6, 'nurse_priya', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'priya.verma@medvault.org', 'Nurse Priya Verma', NULL, 'Emergency & Acute Care', CURRENT_TIMESTAMP);

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
VALUES (13, 'receptionist', '$2a$10$U9LDGKztApw0TjXI3gt68.3HMfnpsCf7HlfH40w2YrrlwRMhZAIwq', 'receptionist@medvault.org', 'Receptionist Sarita Verma', NULL, 'Patient Intake & Reception Desk', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (14, 'labtech', '$2a$10$hWfjzWpgqoy9xSFfTa.X5uTLq.RWkf4jw1qWre4K3NzV3JvT9UH7e', 'labtech@medvault.org', 'Lab Specialist Tech Roy', NULL, 'Clinical Pathology & Laboratory', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (15, 'pharmacist', '$2a$10$u/Xd8bxyQUr5Nqc/9xQhB.b3liUdM.MNO.SaOVkNbkKsi6EsJZPfa', 'pharmacist@medvault.org', 'PharmD Anita Desai', NULL, 'Clinical Pharmacy Services', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, password, email, full_name, specialization, department, created_at) 
VALUES (16, 'billing', '$2a$10$JxvglMjc9cihsQTvpClZpeFA.aXuko6xiRl4zU4J3IDqcRRv.GKGS', 'billing@medvault.org', 'Billing Officer Vikram Patel', NULL, 'Revenue Cycle & Patient Billing', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 6. USER ROLES (JOIN TABLE)
-- ------------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 11);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (3, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (4, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (5, 4);
INSERT INTO user_roles (user_id, role_id) VALUES (6, 4);
INSERT INTO user_roles (user_id, role_id) VALUES (7, 10);
INSERT INTO user_roles (user_id, role_id) VALUES (8, 9);
INSERT INTO user_roles (user_id, role_id) VALUES (9, 9);
INSERT INTO user_roles (user_id, role_id) VALUES (10, 9);
INSERT INTO user_roles (user_id, role_id) VALUES (11, 9);
INSERT INTO user_roles (user_id, role_id) VALUES (12, 9);
INSERT INTO user_roles (user_id, role_id) VALUES (13, 5);
INSERT INTO user_roles (user_id, role_id) VALUES (14, 6);
INSERT INTO user_roles (user_id, role_id) VALUES (15, 7);
INSERT INTO user_roles (user_id, role_id) VALUES (16, 8);

-- ------------------------------------------------------------------------------
-- 7. PATIENTS
-- ------------------------------------------------------------------------------
INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (1, 'PAT-1001', '459-00-1284', 'Kamran Khan', '1985-04-12', 'Male', 'O+', '+91 98765 43210', 'patient@medvault.org', '742 Marine Drive, Mumbai', 'Farah Khan (Wife) - +91 98765 98765', 'Star Health Insurance', 'STAR-9874102', 'GRP-55410', 'Premier Comprehensive Care', 'Type 2 Diabetes, Severe Penicillin Allergy, Mild Asthma', 9, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (2, 'PAT-1002', '218-00-9831', 'Aarav Patel', '1972-09-28', 'Male', 'A+', '+91 98765 12345', 'aarav.patel@example.com', '1204 CG Road, Ahmedabad', 'Priya Patel (Wife) - +91 98765 87654', 'HDFC ERGO Health', 'HDFC-5510923', 'GRP-11092', 'Optima Secure', 'Essential Hypertension, Hyperlipidemia', 10, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (3, 'PAT-1003', '781-00-4491', 'Ananya Sharma', '1996-11-05', 'Female', 'B-', '+91 98765 67890', 'ananya.sharma@example.com', '45 Park Street, Kolkata', 'Rajesh Sharma (Father) - +91 98765 76543', 'ICICI Lombard', 'ICI-7740192', 'GRP-88102', 'Health Shield Gold', 'Latex Allergy', 11, CURRENT_TIMESTAMP);

INSERT INTO patients (id, patient_code, ssn, full_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts, user_id, created_at) 
VALUES (4, 'PAT-1004', '312-00-5582', 'Rohan Mehta', '1990-07-22', 'Male', 'AB+', '+91 98765 88990', 'rohan.mehta@example.com', '88 Bandra Reclamation, Mumbai', 'Neha Mehta (Sister) - +91 98765 11223', 'Care Health Insurance', 'CARE-3341029', 'GRP-99401', 'Peanut Allergy', 12, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 8. PATIENT CARE TEAM ASSIGNMENTS (ABAC)
-- ------------------------------------------------------------------------------
INSERT INTO patient_assignments (id, patient_id, staff_user_id, assignment_type, start_date)
VALUES (1, 1, 3, 'ATTENDING_PHYSICIAN', CURRENT_TIMESTAMP);

INSERT INTO patient_assignments (id, patient_id, staff_user_id, assignment_type, start_date)
VALUES (2, 1, 6, 'ASSIGNED_NURSE', CURRENT_TIMESTAMP);

INSERT INTO patient_assignments (id, patient_id, staff_user_id, assignment_type, start_date)
VALUES (3, 2, 4, 'ATTENDING_PHYSICIAN', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 9. ENCOUNTERS
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
-- 10. ALLERGIES
-- ------------------------------------------------------------------------------
INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (1, 1, 'Penicillin', 'RxNorm-70618', 'DRUG', 'SEVERE', 'Anaphylaxis, acute bronchial constriction, severe hives.', 'ACTIVE', 2, CURRENT_TIMESTAMP);

INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (2, 3, 'Latex', 'SNOMED-300916003', 'ENVIRONMENTAL', 'MODERATE', 'Contact dermatitis and localized pruritus.', 'ACTIVE', 5, CURRENT_TIMESTAMP);

INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (3, 4, 'Peanuts', 'SNOMED-91935009', 'FOOD', 'SEVERE', 'Facial swelling and dyspnea upon exposure.', 'ACTIVE', 2, CURRENT_TIMESTAMP);

INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at)
VALUES (4, 2, 'Sulfa Drugs', 'RxNorm-10160', 'DRUG', 'MODERATE', 'Skin rash and localized hives upon exposure.', 'ACTIVE', 2, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 11. DIAGNOSES
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
-- 12. MEDICAL RECORDS
-- ------------------------------------------------------------------------------
INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (1, 1, 2, 'Routine Cardiac Follow-up & Glycemic Assessment', 'E11.9', 'Mild fatigue, occasional shortness of breath after climbing stairs.', 'Continue Metformin 500mg. Start daily 30-min walking routine. Follow up in 3 months.', 'Patient reports good compliance with diet. Blood pressure slightly elevated.', CURRENT_TIMESTAMP);

INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (2, 2, 2, 'Hypertension Management', 'I10', 'Occasional morning headaches.', 'Continue Lisinopril. Monitor BP daily.', 'BP is stable on current medication.', CURRENT_TIMESTAMP);

INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at)
VALUES (3, 4, 4, 'Annual Neurological Check', 'Z00.00', 'None reported.', 'Maintain regular physical exercise and sleep hygiene.', 'All vitals and reflex responses within optimal baseline parameters.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 13. VITALS
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
-- 14. PRESCRIPTIONS
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
-- 15. APPOINTMENTS
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
-- 16. AUDIT LOGS
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (1, 'SYSTEM', 'SYSTEM', 'SEED', 'DATABASE', '0', '127.0.0.1', 'Initialized MedVault EHR database via manual SQL seed script with 10 production roles and RBAC+ABAC matrices.', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp)
VALUES (2, 'admin', 'ROLE_SYS_ADMIN', 'CREATE', 'USER', '1', '127.0.0.1', 'Provisioned RBAC clinical access credentials across 10 production roles.', CURRENT_TIMESTAMP);

ALTER TABLE departments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE permissions ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE roles ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE users ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE patients ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE patient_assignments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE encounters ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE allergies ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE diagnoses ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE medical_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE vitals ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE prescriptions ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 3000;
