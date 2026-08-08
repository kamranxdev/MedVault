# MedVault EHR Platform - Architecture & System Design Specification

This document provides a senior-engineer-level technical breakdown of the architecture, security patterns, hybrid RBAC+ABAC authorization engine, data flows, and database infrastructure of the **MedVault** Electronic Health Record (EHR) platform.

---

## 🏛️ High-Level System Architecture

MedVault is designed as an enterprise-scale, decoupled, multi-tier healthcare application. It isolates the presentation layer, API security gateway, authorization engine, domain business services, persistence abstraction, and underlying storage targets.

```mermaid
flowchart TD
    subgraph Presentation_Layer ["💻 Presentation Layer (Frontend)"]
        SPA["Angular 19+ SPA (Standalone Components & Signals)"]
        Forms["Reactive Flowsheets (Vitals, Encounters, eRx)"]
        Guards["Angular Functional Route Guards & RBAC Directives"]
        HTTP["Angular HttpClient + Auth Interceptor (JWT)"]
    end

    subgraph Security_Layer ["🛡️ Security & API Gateway Layer (Spring Security 6)"]
        Gateway["REST API Controllers (/api/v1)"]
        JWTFilter["JwtAuthenticationFilter (Stateless Bearer Validation)"]
        RBAC["@PreAuthorize Engine (Permission Evaluator)"]
        ABAC["ABAC Policy Engine (Context, Care Team, Dept, Break-Glass)"]
    end

    subgraph Business_Layer ["🩺 Clinical & Business Logic Layer"]
        AuthSvc["AuthService & UserDetailsService"]
        PatientSvc["PatientService (Master Patient Index - MPI)"]
        ClinicalSvc["ClinicalServices (Vitals, Encounters, eRx, Labs)"]
        SafetyEngine["SmartSafetyService (RxNorm Allergy Checking)"]
        BillingSvc["Billing & RCM Subsystem"]
        AuditSvc["AuditTrailService (HIPAA § 164.312 WORM Ledger)"]
        SyntheaSvc["SyntheaPipelineService (Synthea Generator Engine)"]
        FhirSvc["FhirService (HL7 FHIR R4 Interoperability)"]
    end

    subgraph Persistence_Layer ["📦 Data Access & ORM Layer (Spring Data JPA)"]
        JPA["Spring Data JPA Repositories (18 Interfaces)"]
        ORM["Hibernate ORM 6.4 (Dialect Abstraction)"]
        Pool["HikariCP Connection Pool"]
    end

    subgraph Storage_Layer ["💾 Database Infrastructure Layer (Switchable)"]
        H2["Option 1: H2 In-Memory DB (MODE=PostgreSQL)\n[Dev / Standalone / Unit Tests]"]
        PostgresDocker["Option 2: PostgreSQL 16 Docker Container\n[Local Containerized Deployment]"]
        SupabaseCloud["Option 3: Cloud PostgreSQL (Supabase / AWS RDS)\n[Production / Cloud Deployment]"]
    end

    SPA --> Guards --> HTTP
    HTTP -->|"HTTPS / REST (Bearer JWT)"| Gateway
    Gateway --> JWTFilter
    JWTFilter --> RBAC
    RBAC --> ABAC
    ABAC --> AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & BillingSvc & AuditSvc & SyntheaSvc & FhirSvc
    AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & BillingSvc & AuditSvc & SyntheaSvc & FhirSvc --> JPA
    JPA --> ORM
    ORM --> Pool
    Pool --> H2
    Pool --> PostgresDocker
    Pool --> SupabaseCloud
```

---

## 💡 Real-World Architectural Analogies

To make MedVault's design intuitive across clinical and engineering teams, consider these core component analogies:

| MedVault Component | Real-World Analogy | Technical Function |
| :--- | :--- | :--- |
| **Spring Security & JWT Filter** | **Hospital Badge Scanner & Gatekeeper** | Intercepts every incoming HTTPS request, validates cryptographic token signatures, and verifies user credentials. |
| **Hybrid RBAC + ABAC Engine** | **Department Door Badge Reader + Attending Roster Check** | Evaluates whether the user's role allows the action *AND* whether the user has a valid treatment relationship/department match for the target patient. |
| **Smart Allergy Safety Engine** | **Pharmacist Double-Check Alert** | Cross-references new prescription orders against documented RxNorm patient allergies and flags contraindications before finalizing orders. |
| **HIPAA WORM Audit Ledger** | **Flight Recorder Black Box** | An immutable, append-only vault that logs every data action (who, what, when, IP address) for regulatory compliance under HIPAA § 164.312(b). |
| **Synthea Generator Pipeline** | **Medical Holodeck** | Runs the Synthea Java framework to simulate realistic patient cohorts and generate FHIR R4 bundles. |
| **HL7 FHIR R4 Subsystem** | **Universal Interoperability Translator** | Converts internal MedVault entities into standard FHIR R4 JSON resources (`Patient`, `Encounter`, `Observation`, `MedicationRequest`) for exchange. |

---

## 🔐 Hybrid RBAC + ABAC Authorization Architecture

MedVault uses a 2-tier security model:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Healthcare Provider
    participant Client as Angular 19 Client
    participant JWT as JwtAuthenticationFilter
    participant RBAC as RBAC Evaluator (@PreAuthorize)
    participant ABAC as ABAC Policy Evaluator
    participant Service as Clinical Service
    participant Audit as AuditLogRepository (WORM)

    Staff->>Client: Request Patient PHI Record
    Client->>JWT: GET /api/v1/patients/1001/medical-record (Bearer Token)
    JWT->>JWT: Verify HMAC-SHA256 Signature & Claims
    JWT->>RBAC: Pass SecurityContext (Roles & Granted Authorities)
    
    alt Missing Required Permission
        RBAC-->>Client: 403 Forbidden (RBAC Access Denied)
    else Has Permission (e.g. MEDICAL_HISTORY_READ)
        RBAC->>ABAC: Evaluate Context Attributes (User Dept, Patient ID, Care Team)
        
        alt ABAC Rule Fails (No Care Relationship / Dept Mismatch)
            ABAC->>Audit: Log Access Violation Attempt
            ABAC-->>Client: 403 Forbidden (ABAC Context Denied)
        else ABAC Rule Passes OR Break-Glass Active
            ABAC->>Service: Execute Domain Method
            Service->>Audit: Append WORM Audit Entry (READ_CLINICAL_RECORD)
            Service-->>Client: 200 OK (Patient PHI Payload)
        end
    end
```

---

## 👥 The 10 Baseline System Roles Matrix Summary

| Role | Code | Main Responsibilities & Scope |
| :--- | :--- | :--- |
| **System Administrator** | `ROLE_SYS_ADMIN` | Platform configuration, tenant provisioning, system logging. No direct clinical PHI view. |
| **Organization Administrator** | `ROLE_ORG_ADMIN` | Clinic facility admin, user management, provider scheduling, billing setup. |
| **Doctor / Physician** | `ROLE_DOCTOR` | Clinical diagnosis, progress notes, order entry (eRx, labs), care plans, break-glass. |
| **Nurse** | `ROLE_NURSE` | Patient triage, vitals flowsheets, nursing notes, MAR administration, care plan updates. |
| **Receptionist** | `ROLE_RECEPTIONIST` | Patient intake, demographics, check-in, appointment scheduling, front-desk billing. |
| **Lab Technician** | `ROLE_LAB_TECH` | Specimen processing, laboratory result entry, lab order status tracking. |
| **Pharmacist** | `ROLE_PHARMACIST` | Medication reconciliation, dispensing, RxNorm safety verification, MAR view. |
| **Billing Officer** | `ROLE_BILLING` | Invoicing, insurance claim processing, payment recording, financial reporting. |
| **Patient** | `ROLE_PATIENT` | Self-service portal: view personal vitals, labs, eRx history, consent, appointments. |
| **Auditor / Compliance Officer** | `ROLE_AUDITOR` | Read-only inspection of immutable HIPAA audit logs and security access metrics. |

---

## 💾 Database Infrastructure Flexibility & Decoupling

MedVault decouples business logic from storage engines using **Spring Data JPA** and **Hibernate ORM**:

```mermaid
graph LR
    subgraph Application_Core ["Spring Boot Backend Core"]
        Entities["JPA Entities (@Entity)"]
        Repos["18 Repository Interfaces"]
    end

    subgraph Hibernate_Dialects ["Hibernate Dialect Abstraction"]
        DialectH2["H2Dialect"]
        DialectPG["PostgreSQLDialect"]
    end

    subgraph Execution_Targets ["Target Execution Environment"]
        TargetH2["RAM (In-Memory H2 DB)"]
        TargetDocker["Local Docker (PostgreSQL 16)"]
        TargetCloud["Cloud PostgreSQL (Supabase / AWS RDS)"]
    end

    Entities --> Repos
    Repos --> DialectH2
    Repos --> DialectPG
    DialectH2 --> TargetH2
    DialectPG --> TargetDocker
    DialectPG --> TargetCloud
```

---

## 📋 Comprehensive Endpoint Authorization Mapping

For complete details on permission definitions and attribute policy evaluation rules, refer to [docs/rbac-abac-matrix.md](file:///mnt/workspace/MedVault/docs/rbac-abac-matrix.md).
