# MedVault EHR Platform - Architecture & System Design Document

This document provides a comprehensive technical breakdown of the architecture, security patterns, data flows, and database infrastructure of the **MedVault** Electronic Health Record (EHR) system.

---

## 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client_Layer ["💻 Client Presentation Layer (Frontend)"]
        UI["Angular 19+ SPA (Standalone Components & Signals)"]
        Forms["Reactive Forms & Clinical Flowsheets"]
        HTTP["Angular HttpClient + Auth Interceptor (JWT)"]
    end

    subgraph API_Security_Layer ["🛡️ API & Security Layer (Spring Security 6)"]
        Gateway["REST API Controllers (/api/v1)"]
        JWTFilter["JwtAuthenticationFilter (Stateless Bearer Validation)"]
        RBAC["@EnableMethodSecurity / @PreAuthorize Engine"]
    end

    subgraph Service_Layer ["🩺 Business & Clinical Logic Layer"]
        AuthSvc["AuthService & UserDetailsService"]
        PatientSvc["PatientService (Master Patient Index - MPI)"]
        ClinicalSvc["ClinicalServices (Vitals, Encounters, eRx)"]
        SafetyEngine["SmartSafetyService (RxNorm Allergy Checking)"]
        AuditSvc["AuditTrailService (HIPAA § 164.312 WORM Ledger)"]
        SynthSvc["SyntheticDataService (Synthea Cohort Generator)"]
        FhirSvc["FhirController (HL7 FHIR R4 Export Engine)"]
    end

    subgraph Persistence_Layer ["📦 Data Access Layer (Spring Data JPA)"]
        JPA["Spring Data JPA Repositories (11 Interfaces)"]
        ORM["Hibernate ORM 6.4 (Dialect Abstraction)"]
        Pool["HikariCP Connection Pool"]
    end

    subgraph DB_Layer ["💾 Database Infrastructure Layer (Switchable)"]
        H2["Option 1: H2 In-Memory DB (MODE=PostgreSQL)\n[Dev / Standalone / Unit Tests]"]
        PostgresDocker["Option 2: PostgreSQL 16 Docker Container\n[Local Containerized Deployment]"]
        SupabaseCloud["Option 3: Cloud PostgreSQL (Supabase / AWS RDS)\n[Production / Cloud Deployment]"]
    end

    UI --> HTTP
    HTTP -->|"HTTPS / REST (Bearer Token)"| Gateway
    Gateway --> JWTFilter
    JWTFilter --> RBAC
    RBAC --> AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & AuditSvc & SynthSvc & FhirSvc
    AuthSvc & PatientSvc & ClinicalSvc & SafetyEngine & AuditSvc & SynthSvc & FhirSvc --> JPA
    JPA --> ORM
    ORM --> Pool
    Pool --> H2
    Pool --> PostgresDocker
    Pool --> SupabaseCloud
```

---

## 🛡️ Security & Authentication Flow Architecture

MedVault implements stateless, token-based authentication compliant with HIPAA administrative and technical safeguards (§ 164.312).

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

    User->>Client: Submit Login Credentials
    Client->>Controller: POST /api/auth/login
    Controller-->>Client: 200 OK + JWT Bearer Token
    
    User->>Client: Prescribe Medication (eRx)
    Client->>SecFilter: POST /api/prescriptions (Authorization: Bearer <token>)
    SecFilter->>SecFilter: Validate Signature & Claims
    SecFilter->>Controller: Forward Authenticated SecurityContext
    Controller->>Safety: Check Allergy Contraindications
    
    alt Contraindication Detected
        Safety-->>Controller: Return Warning Flag & Details
    else Safe / Override Accepted
        Safety->>DB: Persist Prescription Record
        Controller->>Audit: Log WORM Audit Trail Record
        Audit->>DB: INSERT INTO audit_logs
        Controller-->>Client: 201 Created (eRx Confirmed)
    end
```

---

## 🔑 Role-Based Access Control (RBAC) Matrix

MedVault enforces fine-grained method-level security using Spring Security `@PreAuthorize`:

| Endpoint Group | Role Required | Operations Permitted |
| :--- | :--- | :--- |
| `/api/auth/**` | Public / Anonymous | Login, Registration |
| `/api/patients/**` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_AUDITOR` | View Master Patient Index (MPI), Search Patients |
| `/api/patients` | `ROLE_ADMIN` | Create Patient Profile |
| `/api/patients/user/{id}` | `ROLE_PATIENT` | Self-Service Patient Portal View |
| `/api/encounters/**` | `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_ADMIN` | View Visit Summaries & Record SOAP Notes |
| `/api/prescriptions/**` | `ROLE_DOCTOR` | Run Allergy Safety Checks & Submit eRx Orders |
| `/api/vitals/**` | `ROLE_DOCTOR`, `ROLE_NURSE` | Record & Track Longitudinal Patient Vitals |
| `/api/admin/audit-logs` | `ROLE_ADMIN`, `ROLE_AUDITOR` | Inspect Immutable HIPAA Audit Ledger |
| `/fhir/v1/**` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_AUDITOR` | Export HL7 FHIR R4 Bundles |

---

## 💾 Database Infrastructure Flexibility & Decoupling

MedVault decouples business code from underlying storage engines using **Spring Data JPA** and **Hibernate ORM**. The database infrastructure can be swapped without modifying backend source code:

```mermaid
graph LR
    subgraph Application_Core ["Spring Boot Backend Core"]
        Entities["JPA Entities (@Entity)"]
        Repos["Repository Interfaces"]
    end

    subgraph Hibernate_Dialects ["Hibernate Dialect Abstraction"]
        DialectH2["H2Dialect"]
        DialectPG["PostgreSQLDialect"]
    end

    subgraph Infrastructure_Targets ["Target Execution Environment"]
        TargetH2["RAM (In-Memory H2)"]
        TargetDocker["Local Docker (PostgreSQL 16)"]
        TargetCloud["Cloud (Supabase / AWS RDS)"]
    end

    Entities --> Repos
    Repos --> DialectH2
    Repos --> DialectPG
    DialectH2 --> TargetH2
    DialectPG --> TargetDocker
    DialectPG --> TargetCloud
```

### Environment Switching Mechanism

Database selection is governed dynamically by environment variables configured in `backend/src/main/resources/application.properties`:

| Target Environment | `SPRING_DATASOURCE_URL` | `SPRING_JPA_DATABASE_PLATFORM` | Execution Trigger |
| :--- | :--- | :--- | :--- |
| **Standalone H2 (RAM)** | `jdbc:h2:mem:medvaultdb;MODE=PostgreSQL` | `org.hibernate.dialect.H2Dialect` | `./mvnw spring-boot:run` (Default) |
| **Docker PostgreSQL** | `jdbc:postgresql://localhost:5432/medvault` | `org.hibernate.dialect.PostgreSQLDialect` | `docker compose up -d` |
| **Cloud PostgreSQL** | `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require` | `org.hibernate.dialect.PostgreSQLDialect` | System Environment Variables |

---

## 🌐 HL7 FHIR R4 Interoperability Subsystem

MedVault features a built-in HL7 FHIR R4 converter translating internal relational database models into standard FHIR resources:

* **FHIR Patient** (`/fhir/v1/Patient`): Demographics, MRN, insurance coverage.
* **FHIR Encounter** (`/fhir/v1/Encounter`): Visit classification, chief complaints, attending providers.
* **FHIR AllergyIntolerance** (`/fhir/v1/AllergyIntolerance`): Substance, severity, reaction description.
* **FHIR Condition** (`/fhir/v1/Condition`): Problems, ICD-10 & SNOMED CT clinical codes.
* **FHIR MedicationRequest** (`/fhir/v1/MedicationRequest`): RxNorm codes, dosage instructions, refills.
* **FHIR Observation** (`/fhir/v1/Observation`): Vital signs flowsheet (BP, HR, SpO2, BMI).

---

## 📁 Repository Architectural Map

```
MedVault/
├── architecture.md           # Architecture & System Design Specification (This Document)
├── README.md                 # Master Quick Start & Execution Guide
├── docker-compose.yml        # PostgreSQL Container Orchestration
│
├── backend/                  # Spring Boot 3.2 REST API & Security Engine
│   ├── src/main/java/com/medvault/
│   │   ├── config/           # SecurityConfig, CorsConfig
│   │   ├── controller/       # AuthController, PatientController, FhirController, etc.
│   │   ├── dto/              # Request/Response Data Transfer Objects & JWT Auth DTOs
│   │   ├── model/            # JPA Domain Entities (User, Patient, Encounter, Vital, etc.)
│   │   ├── repository/       # 11 Spring Data JPA Repositories
│   │   ├── security/         # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetails
│   │   └── service/          # SmartSafetyService, SyntheticDataService, AuditTrailService
│   │
│   └── src/main/resources/
│       ├── schema.sql        # Database DDL Script
│       ├── seed.sql          # Sample Data DML Script
│       └── application.properties
│
└── frontend/                 # Angular 19 Enterprise Web Application
    └── src/app/
        ├── components/       # Standalone UI Components (Patients, eRx, Vitals, Audit)
        ├── guards/           # Angular AuthGuard & RoleGuard
        ├── interceptors/     # JwtInterceptor (Bearer Token Injection)
        └── services/         # ApiService, AuthService, PatientService
```
