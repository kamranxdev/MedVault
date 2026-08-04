# MedVault EHR Platform - Architecture & System Design Specification

This document provides a senior-engineer-level technical breakdown of the architecture, security patterns, data flows, and database infrastructure of the **MedVault** Electronic Health Record (EHR) platform.

---

## 🏛️ High-Level System Architecture

MedVault is designed as an enterprise-scale, decoupled, multi-tier healthcare application. It isolates the presentation layer, API security, domain business services, persistence abstraction, and underlying storage targets.

```mermaid
flowchart TD
    subgraph Presentation_Layer ["💻 Presentation Layer (Frontend)"]
        SPA["Angular 19+ SPA (Standalone Components & Signals)"]
        Forms["Reactive Forms & Clinical Flowsheets"]
        HTTP["Angular HttpClient + Auth Interceptor (JWT)"]
    end

    subgraph Security_Layer ["🛡️ Security & API Gateway Layer (Spring Security 6)"]
        Gateway["REST API Controllers (/api/v1)"]
        JWTFilter["JwtAuthenticationFilter (Stateless Bearer Validation)"]
        RBAC["@EnableMethodSecurity / @PreAuthorize Engine"]
    end

    subgraph Business_Layer ["🩺 Clinical & Business Logic Layer"]
        AuthSvc["AuthService & UserDetailsService"]
        PatientSvc["PatientService (Master Patient Index - MPI)"]
        ClinicalSvc["ClinicalServices (Vitals, Encounters, eRx)"]
        SafetyEngine["SmartSafetyService (RxNorm Allergy Checking)"]
        AuditSvc["AuditTrailService (HIPAA § 164.312 WORM Ledger)"]
        SyntheaSvc["SyntheaPipelineService (Synthea Generator Engine)"]
        FhirSvc["FhirService (HL7 FHIR R4 Export & Ingest Engine)"]
    end

    subgraph Persistence_Layer ["📦 Data Access & ORM Layer (Spring Data JPA)"]
        JPA["Spring Data JPA Repositories (15 Interfaces)"]
        ORM["Hibernate ORM 6.4 (Dialect Abstraction)"]
        Pool["HikariCP Connection Pool"]
    end

    subgraph Storage_Layer ["💾 Database Infrastructure Layer (Switchable)"]
        H2["Option 1: H2 In-Memory DB (MODE=PostgreSQL)\n[Dev / Standalone / Unit Tests]"]
        PostgresDocker["Option 2: PostgreSQL 16 Docker Container\n[Local Containerized Deployment]"]
        SupabaseCloud["Option 3: Cloud PostgreSQL (Supabase / AWS RDS)\n[Production / Cloud Deployment]"]
    end

    SPA --> HTTP
    HTTP -->|"HTTPS / REST (Bearer JWT)"| Gateway
    Gateway --> JWTFilter
    JWTFilter --> RBAC
    RBAC --> AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & AuditSvc & SyntheaSvc & FhirSvc
    AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & AuditSvc & SyntheaSvc & FhirSvc --> JPA
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
| **Spring Security & JWT Filter** | **Hospital Badge Scanner & Security Gate** | Intercepts every incoming HTTPS request, validates the cryptographic token signature, and checks the user's role before granting access to patient records. |
| **Smart Allergy Safety Engine** | **Pharmacist Double-Check Alert** | Automatically cross-references new prescription orders against documented patient allergies and flags potential contraindications before an eRx order is finalized. |
| **HIPAA WORM Audit Ledger** | **Black Box Flight Recorder** | An immutable, append-only vault that logs every data action (who, what, when, IP address) for regulatory compliance under HIPAA § 164.312(b). |
| **Synthea Generator Pipeline** | **Medical Holodeck** | Runs the official Synthea Java framework to simulate realistic patient lifetimes (demographics, chronic conditions, vitals, prescriptions) and outputs HL7 FHIR R4 bundles. |
| **HL7 FHIR R4 Interoperability Subsystem** | **Universal Translator** | Converts internal MedVault database entities into standard FHIR R4 JSON resources (`Patient`, `Encounter`, `Observation`, etc.) for seamless exchange with external EHRs. |

---

## 🛡️ Security & Authentication Architecture

MedVault implements stateless JWT bearer authentication compliant with HIPAA administrative and technical safeguards (§ 164.312).

```mermaid
sequenceDiagram
    autonumber
    actor User as Physician / Nurse / Admin
    participant Client as Angular 19 Client
    participant SecFilter as JwtAuthenticationFilter
    participant Controller as REST Controller
    participant Safety as SmartSafetyService
    participant Audit as AuditLogRepository
    participant DB as PostgreSQL / H2 Database

    User->>Client: Submit Credentials
    Client->>Controller: POST /api/auth/login
    Controller-->>Client: 200 OK + Bearer JWT Token
    
    User->>Client: Prescribe Medication (eRx)
    Client->>SecFilter: POST /api/prescriptions (Header: Bearer <token>)
    SecFilter->>SecFilter: Validate JWT Signature & Roles
    SecFilter->>Controller: Pass Authenticated SecurityContext
    Controller->>Safety: Check RxNorm Allergy Contraindications
    
    alt Contraindication Detected
        Safety-->>Controller: Return Warning Payload
    else Safe / Override Accepted
        Safety->>DB: Persist Prescription Record
        Controller->>Audit: Append WORM Audit Record
        Audit->>DB: INSERT INTO audit_logs
        Controller-->>Client: 201 Created (eRx Order Confirmed)
    end
```

---

## 💾 Database Infrastructure Flexibility & Decoupling

MedVault decouples business code from underlying storage engines using **Spring Data JPA** and **Hibernate ORM**. The database infrastructure can be swapped without modifying backend source code:

```mermaid
graph LR
    subgraph Application_Core ["Spring Boot Backend Core"]
        Entities["JPA Entities (@Entity)"]
        Repos["15 Repository Interfaces"]
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

## 🔐 Role-Based Access Control (RBAC) Matrix

MedVault enforces fine-grained method-level security using Spring Security `@PreAuthorize`:

| Endpoint Group | Allowed Roles | Access Scope & Authorization |
| :--- | :--- | :--- |
| `/api/auth/**` | Public / Anonymous | Sign in, public patient self-registration (`ROLE_PATIENT` only) |
| `/api/patients/**` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_AUDITOR` | View Master Patient Index (MPI), search patient directory |
| `/api/patients` | `ROLE_ADMIN` | Register new patient profile in MPI |
| `/api/patients/user/{id}` | `ROLE_PATIENT` | Self-service view strictly scoped to logged-in patient's record |
| `/api/encounters/**` | `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_ADMIN` | View visit summaries, record SOAP progress notes |
| `/api/prescriptions/**` | `ROLE_DOCTOR` | Run allergy safety checks, issue eRx orders with overrides |
| `/api/vitals/**` | `ROLE_DOCTOR`, `ROLE_NURSE` | Record and track longitudinal patient vitals flowsheets |
| `/api/admin/audit-logs` | `ROLE_ADMIN`, `ROLE_AUDITOR` | Inspect immutable HIPAA forensic audit ledger |
| `/api/synthetic/**` | `ROLE_ADMIN`, `ROLE_DOCTOR` | Execute Synthea generator pipeline, ingest FHIR bundles |
| `/fhir/v1/**` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_AUDITOR` | Read/write standard HL7 FHIR R4 clinical resources & bundles |
