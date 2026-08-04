# MedVault Database Schema & Entity Relationship Guide

This document provides a comprehensive reference for MedVault's relational database schema, entity relationships, and data model design decisions.

---

## 💡 Analogy: The Hospital Filing Cabinet System

MedVault's database is organized like a large hospital's physical filing system:

- **`users` table** → The **Staff Directory** — contains every employee (doctors, nurses, admins, auditors) and their credentials.
- **`roles` & `user_roles` tables** → The **Badge Access List** — maps which staff members hold which access levels (Doctor, Nurse, Admin, Auditor, Patient).
- **`patients` table** → The **Master Patient Index (MPI)** — the central registry of every patient, their demographics, insurance, and medical alerts.
- **`encounters` table** → The **Visit Log Book** — records every time a patient checks into the hospital (outpatient, inpatient, emergency).
- **`vitals` table** → The **Bedside Telemetry Charts** — time-stamped vital sign recordings (BP, HR, Temp, SpO2, Glucose).
- **`prescriptions` table** → The **Pharmacy Order Pad** — every eRx order with dosage, frequency, and RxNorm coding.
- **`allergies` table** → The **Red Wristband Register** — documented allergens that trigger safety alerts before prescriptions are issued.
- **`diagnoses` table** → The **Problem List Binder** — active and chronic conditions coded in ICD-10 and SNOMED-CT.
- **`audit_logs` table** → The **Black Box Vault** — an immutable, append-only record of every system action for HIPAA compliance.

---

## 🗄️ Entity Relationship Diagram

```mermaid
erDiagram
    ROLES {
        BIGINT id PK
        VARCHAR name UK "ROLE_ADMIN, ROLE_DOCTOR, etc."
    }

    USERS {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password "BCrypt hashed"
        VARCHAR email UK
        VARCHAR full_name
        VARCHAR specialization
        VARCHAR department
        TIMESTAMP created_at
    }

    USER_ROLES {
        BIGINT user_id FK
        BIGINT role_id FK
    }

    PATIENTS {
        BIGINT id PK
        VARCHAR patient_code UK "PAT-1001"
        VARCHAR ssn
        VARCHAR full_name
        DATE date_of_birth
        VARCHAR gender
        VARCHAR blood_type
        VARCHAR phone
        VARCHAR email
        VARCHAR address
        VARCHAR emergency_contact
        VARCHAR insurance_provider
        VARCHAR insurance_policy_number
        VARCHAR medical_alerts
        BIGINT user_id FK "Links to login account"
        TIMESTAMP created_at
    }

    ENCOUNTERS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT attending_provider_id FK
        VARCHAR encounter_type "OUTPATIENT, INPATIENT, EMERGENCY"
        VARCHAR chief_complaint
        VARCHAR clinical_notes "SOAP progress notes"
        VARCHAR discharge_summary
        VARCHAR status "ACTIVE, COMPLETED"
        TIMESTAMP encounter_date
    }

    ALLERGIES {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR allergen_name
        VARCHAR allergen_code "RxNorm code"
        VARCHAR category "MEDICATION, ENVIRONMENT, FOOD"
        VARCHAR severity "MILD, MODERATE, SEVERE"
        VARCHAR reaction_description
        VARCHAR status
        BIGINT recorded_by_id FK
        TIMESTAMP recorded_at
    }

    DIAGNOSES {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        VARCHAR condition_name
        VARCHAR icd_code "ICD-10 code"
        VARCHAR snomed_code "SNOMED-CT code"
        DATE onset_date
        VARCHAR status "ACTIVE, CHRONIC, RESOLVED"
        VARCHAR notes
        TIMESTAMP recorded_at
    }

    VITALS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT recorded_by_id FK
        VARCHAR blood_pressure "120/80 mmHg"
        INT heart_rate
        DOUBLE temperature
        INT oxygen_saturation
        INT respiratory_rate
        DOUBLE weight_kg
        DOUBLE height_cm
        DOUBLE bmi "Auto-calculated"
        INT blood_glucose
        TIMESTAMP recorded_at
    }

    PRESCRIPTIONS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        VARCHAR medication_name
        VARCHAR rx_norm_code "RxNorm code"
        VARCHAR dosage
        VARCHAR route
        VARCHAR frequency
        INT duration_days
        INT refills
        VARCHAR instructions
        VARCHAR status "ACTIVE, DISCONTINUED, COMPLETED"
        TIMESTAMP prescribed_at
    }

    APPOINTMENTS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        TIMESTAMP appointment_date
        VARCHAR status
        VARCHAR stage "SCHEDULED, TRIAGE, IN_PROGRESS, etc."
        VARCHAR reason
        VARCHAR notes
        BOOLEAN insurance_verified
        BIGINT vitals_id FK
        TIMESTAMP created_at
    }

    APPOINTMENT_CANCELLATIONS {
        BIGINT id PK
        BIGINT appointment_id FK UK
        BIGINT cancelled_by_user_id FK
        VARCHAR cancelled_by_role
        VARCHAR cancellation_reason
        VARCHAR additional_comment
        TIMESTAMP cancelled_at
        VARCHAR refund_status
    }

    APPOINTMENT_NOTES {
        BIGINT id PK
        BIGINT appointment_id FK
        BIGINT author_id FK
        VARCHAR author_name
        VARCHAR note_type "CLINICAL, ADMIN, NURSE"
        VARCHAR content
        TIMESTAMP created_at
        BOOLEAN is_edited
    }

    APPOINTMENT_LAB_ORDERS {
        BIGINT id PK
        BIGINT appointment_id FK
        VARCHAR test_name
        VARCHAR priority "ROUTINE, URGENT, STAT"
        VARCHAR clinical_indications
        BIGINT ordered_by_id FK
        TIMESTAMP ordered_at
    }

    APPOINTMENT_BILLINGS {
        BIGINT id PK
        BIGINT appointment_id FK UK
        DOUBLE consultation_fee
        DOUBLE triage_fee
        DOUBLE lab_fee
        DOUBLE pharmacy_fee
        DOUBLE insurance_coverage
        DOUBLE net_payable
        VARCHAR payment_status "PENDING, PAID, WAIVED"
        TIMESTAMP generated_at
    }

    MEDICAL_RECORDS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        VARCHAR diagnosis
        VARCHAR icd_code
        VARCHAR symptoms
        VARCHAR treatment_plan
        VARCHAR notes
        TIMESTAMP created_at
    }

    AUDIT_LOGS {
        BIGINT id PK
        VARCHAR username
        VARCHAR user_role
        VARCHAR action
        VARCHAR entity_name
        VARCHAR resource_id
        VARCHAR ip_address
        VARCHAR details
        TIMESTAMP timestamp "Immutable WORM entry"
    }

    USERS ||--o{ USER_ROLES : "has"
    ROLES ||--o{ USER_ROLES : "assigned to"
    USERS ||--o| PATIENTS : "login account"
    PATIENTS ||--o{ ENCOUNTERS : "visits"
    USERS ||--o{ ENCOUNTERS : "attends as provider"
    PATIENTS ||--o{ ALLERGIES : "has documented"
    PATIENTS ||--o{ DIAGNOSES : "diagnosed with"
    PATIENTS ||--o{ VITALS : "recorded for"
    PATIENTS ||--o{ PRESCRIPTIONS : "prescribed to"
    PATIENTS ||--o{ APPOINTMENTS : "scheduled for"
    PATIENTS ||--o{ MEDICAL_RECORDS : "has records"
    USERS ||--o{ PRESCRIPTIONS : "prescribed by"
    USERS ||--o{ DIAGNOSES : "diagnosed by"
    USERS ||--o{ VITALS : "recorded by"
    USERS ||--o{ APPOINTMENTS : "doctor for"
    APPOINTMENTS ||--o| APPOINTMENT_CANCELLATIONS : "may be cancelled"
    APPOINTMENTS ||--o{ APPOINTMENT_NOTES : "has notes"
    APPOINTMENTS ||--o{ APPOINTMENT_LAB_ORDERS : "has lab orders"
    APPOINTMENTS ||--o| APPOINTMENT_BILLINGS : "has billing"
    APPOINTMENTS ||--o| VITALS : "linked vitals"
```

---

## 📊 Table Summary & Row Counts

| Table | Purpose | Key Foreign Keys | Approximate Seed Rows |
| :--- | :--- | :--- | :--- |
| `roles` | RBAC role definitions | — | 5 (ADMIN, DOCTOR, NURSE, PATIENT, AUDITOR) |
| `users` | Staff & patient login accounts | `→ roles (via user_roles)` | 8 |
| `user_roles` | Many-to-many user ↔ role mapping | `→ users`, `→ roles` | 8 |
| `patients` | Master Patient Index (MPI) | `→ users (optional)` | 3 |
| `encounters` | Clinical visit records | `→ patients`, `→ users` | 3 |
| `allergies` | Documented allergens | `→ patients`, `→ users` | 3 |
| `diagnoses` | Problem list (ICD-10, SNOMED) | `→ patients`, `→ users` | 3 |
| `vitals` | Longitudinal vital signs | `→ patients`, `→ users` | 6 |
| `prescriptions` | eRx medication orders (RxNorm) | `→ patients`, `→ users` | 3 |
| `appointments` | Scheduled visits & workflow stages | `→ patients`, `→ users`, `→ vitals` | 5 |
| `appointment_cancellations` | Cancellation records | `→ appointments`, `→ users` | 1 |
| `appointment_notes` | Clinical & admin notes per visit | `→ appointments`, `→ users` | 4 |
| `appointment_lab_orders` | Lab test orders | `→ appointments`, `→ users` | 2 |
| `appointment_billings` | Financial billing summaries | `→ appointments` | 3 |
| `medical_records` | Legacy medical records | `→ patients`, `→ users` | 3 |
| `audit_logs` | HIPAA WORM compliance vault | — (standalone) | 2 |

---

## 🔑 Coding Standards & Terminology Reference

MedVault uses standardized healthcare coding systems throughout the database:

| Coding System | Authority | Used In | Example |
| :--- | :--- | :--- | :--- |
| **ICD-10-CM** | WHO / CMS | `diagnoses.icd_code` | `E11.9` (Type 2 Diabetes) |
| **SNOMED-CT** | SNOMED International | `diagnoses.snomed_code` | `44054006` (Type 2 Diabetes) |
| **RxNorm** | NLM (NIH) | `prescriptions.rx_norm_code`, `allergies.allergen_code` | `7980` (Penicillin V) |
| **LOINC** | Regenstrief Institute | Vital signs (via Synthea ingest) | `8480-6` (Systolic BP) |
| **HL7 FHIR R4** | HL7 International | FHIR API resource format | `Patient`, `Observation`, `Bundle` |
