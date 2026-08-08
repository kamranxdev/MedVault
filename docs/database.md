# MedVault Database Schema & Entity Relationship Guide

This document provides a comprehensive reference for MedVault's relational database schema, entity relationships, security tables, and data model design decisions.

---

## 💡 Analogy: The Hospital Filing Cabinet System

MedVault's database is organized like a large hospital's physical filing system:

- **`users` table** → The **Staff Directory** — contains every employee (doctors, nurses, admins, auditors) and their credentials.
- **`roles` & `user_roles` tables** → The **Badge Access List** — maps staff members to their assigned role definitions.
- **`permissions` & `role_permissions` tables** → The **Detailed Permission Matrix** — fine-grained authority keys (e.g., `PRESCRIPTION_CREATE`, `VITALS_READ`).
- **`departments` & `patient_assignments` tables** → The **Care Roster & Facility Assignment** — maps staff and patients to departments and active treatment care teams for ABAC evaluation.
- **`abac_policies` table** → The **Policy Rules Registry** — configurable SpEL policies enforcing context-based authorization constraints.
- **`patients` table** → The **Master Patient Index (MPI)** — central registry of patient identity, demographics, insurance, and medical alerts.
- **`encounters` table** → The **Visit Log Book** — records every patient check-in (outpatient, inpatient, emergency).
- **`vitals` table** → The **Bedside Telemetry Charts** — time-stamped vital sign flowsheets.
- **`prescriptions` table** → The **Pharmacy Order Pad** — eRx orders with dosage, frequency, and RxNorm coding.
- **`allergies` table** → The **Red Wristband Register** — documented allergens that trigger safety alerts before prescriptions are issued.
- **`diagnoses` table** → The **Problem List Binder** — active/chronic conditions coded in ICD-10 and SNOMED-CT.
- **`audit_logs` table** → The **Black Box Vault** — immutable, append-only record of every system action for HIPAA § 164.312 compliance.

---

## 🗄️ Comprehensive Entity Relationship Diagram

```mermaid
erDiagram
    ROLES {
        BIGINT id PK
        VARCHAR name UK "ROLE_SYS_ADMIN, ROLE_DOCTOR, etc."
        VARCHAR description
    }

    PERMISSIONS {
        BIGINT id PK
        VARCHAR code UK "PATIENT_READ, PRESCRIPTION_CREATE, etc."
        VARCHAR category "PATIENT, CLINICAL, BILLING, SYSTEM"
        VARCHAR description
    }

    ROLE_PERMISSIONS {
        BIGINT role_id FK
        BIGINT permission_id FK
    }

    USERS {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password "BCrypt hashed"
        VARCHAR email UK
        VARCHAR full_name
        VARCHAR specialization
        BIGINT department_id FK
        TIMESTAMP created_at
    }

    USER_ROLES {
        BIGINT user_id FK
        BIGINT role_id FK
    }

    DEPARTMENTS {
        BIGINT id PK
        VARCHAR name UK "CARDIOLOGY, EMERGENCY, ONCOLOGY"
        VARCHAR code UK "CARD, EMG, ONC"
        BIGINT facility_id FK
    }

    PATIENT_ASSIGNMENTS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT staff_user_id FK
        VARCHAR assignment_type "ATTENDING_PHYSICIAN, ASSIGNED_NURSE"
        TIMESTAMP start_date
        TIMESTAMP end_date
    }

    ABAC_POLICIES {
        BIGINT id PK
        VARCHAR policy_name UK
        VARCHAR target_resource
        VARCHAR action
        VARCHAR spel_expression
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
        BIGINT user_id FK "Links to patient self-service account"
        BIGINT department_id FK
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

    ROLES ||--o{ USER_ROLES : "has"
    USERS ||--o{ USER_ROLES : "assigned to"
    ROLES ||--o{ ROLE_PERMISSIONS : "has"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "granted via"
    DEPARTMENTS ||--o{ USERS : "employs"
    DEPARTMENTS ||--o{ PATIENTS : "admits to"
    PATIENTS ||--o{ PATIENT_ASSIGNMENTS : "care team"
    USERS ||--o{ PATIENT_ASSIGNMENTS : "staff member"
    USERS ||--o| PATIENTS : "login account"
    PATIENTS ||--o{ ENCOUNTERS : "visits"
    USERS ||--o{ ENCOUNTERS : "attends as provider"
    PATIENTS ||--o{ ALLERGIES : "has documented"
    PATIENTS ||--o{ DIAGNOSES : "diagnosed with"
    PATIENTS ||--o{ VITALS : "recorded for"
    PATIENTS ||--o{ PRESCRIPTIONS : "prescribed to"
    PATIENTS ||--o{ APPOINTMENTS : "scheduled for"
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

## 📊 Table Summary

| Table | Purpose | Primary / Foreign Keys | Access Control Level |
| :--- | :--- | :--- | :--- |
| `roles` | Definitions for 10 baseline roles | `id` (PK) | Read-only runtime lookup |
| `permissions` | Granular security authority codes | `id` (PK) | Read-only runtime lookup |
| `role_permissions` | Mappings between roles and permissions | `role_id`, `permission_id` (FKs) | System Admin managed |
| `users` | Staff & patient login accounts | `id` (PK), `department_id` (FK) | Authentication core |
| `user_roles` | Mappings between users and roles | `user_id`, `role_id` (FKs) | Admin managed |
| `departments` | Clinic/hospital functional units | `id` (PK) | Admin managed |
| `patient_assignments` | Active care team roster (ABAC) | `id` (PK), `patient_id`, `staff_user_id` (FKs) | Attending / Admin managed |
| `abac_policies` | Dynamic SpEL policy definitions | `id` (PK) | Security Admin managed |
| `patients` | Master Patient Index (MPI) | `id` (PK), `user_id` (FK) | RBAC + ABAC protected PHI |
| `encounters` | Clinical visit encounters | `id` (PK), `patient_id`, `attending_provider_id` (FKs) | RBAC + ABAC protected PHI |
| `allergies` | Patient RxNorm allergy list | `id` (PK), `patient_id`, `recorded_by_id` (FKs) | RBAC + ABAC protected PHI |
| `diagnoses` | Problem list (ICD-10, SNOMED) | `id` (PK), `patient_id`, `doctor_id` (FKs) | RBAC + ABAC protected PHI |
| `vitals` | Longitudinal vital signs flowsheets | `id` (PK), `patient_id`, `recorded_by_id` (FKs) | RBAC + ABAC protected PHI |
| `prescriptions` | eRx medication orders | `id` (PK), `patient_id`, `doctor_id` (FKs) | RBAC + ABAC protected PHI |
| `appointments` | Visit scheduling & workflow stages | `id` (PK), `patient_id`, `doctor_id` (FKs) | RBAC + ABAC protected PHI |
| `appointment_billings` | Revenue cycle & invoice records | `id` (PK), `appointment_id` (FK) | Billing / Admin restricted |
| `audit_logs` | WORM compliance ledger | `id` (PK) | Append-Only (WORM) |
