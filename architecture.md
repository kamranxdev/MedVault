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

## 🌐 HL7 FHIR R4 Enterprise Interoperability Subsystem

MedVault features a built-in, gold-standard **HL7 FHIR Release 4 (v4.0.1)** engine (`FhirService` & `FhirController`) exposing full RESTful CRUD interactions, discovery metadata, and clinical bundles:

* **FHIR Conformance Statement** (`GET /fhir/v1/metadata`): Returns official FHIR R4 `CapabilityStatement` declaring server software capabilities, supported resources, search parameters, and OAuth2/Bearer JWT security definitions.
* **FHIR Patient** (`/fhir/v1/Patient`): Complete `HumanName` structures, MRN (`urn:oid:2.16.840.1.113883.4.1`) & SSN identifiers, telecom, address, gender, birth date, and insurance extension. Supports `GET`, `POST`, `PUT`, `DELETE`, and single read `GET /Patient/{id}`.
* **FHIR Encounter** (`/fhir/v1/Encounter`): Visit classification (`AMB`/`IMP`/`EMER`), chief complaint, participant practitioners, and start/end period.
* **FHIR AllergyIntolerance** (`/fhir/v1/AllergyIntolerance`): Clinical/verification status codes, category, criticality, and RxNorm substance codings (`http://www.nlm.nih.gov/research/umls/rxnorm`).
* **FHIR Condition** (`/fhir/v1/Condition`): Problem list items with dual **ICD-10** (`http://hl7.org/fhir/sid/icd-10`) & **SNOMED CT** (`http://snomed.info/sct`) codings.
* **FHIR MedicationRequest** (`/fhir/v1/MedicationRequest`): Active eRx orders with RxNorm codings, requester practitioner, intent (`order`), and dosage instructions.
* **FHIR Observation** (`/fhir/v1/Observation`): Vital signs flowsheet with standard **LOINC** codes (`http://loinc.org`) and **UCUM** units (`mmHg`, `/min`, `Cel`, `%`, `kg/m2`, `mg/dL`):
  - Blood Pressure Panel (`85354-9`) with Systolic (`8480-6`) & Diastolic (`8462-4`) components
  - Heart Rate (`8867-4`), Body Temperature (`8310-5`), SpO2 (`2708-6`), Respiratory Rate (`9279-1`)
  - Weight (`29463-7`), Height (`8302-2`), BMI (`39156-5`), Blood Glucose (`15074-8`).
* **Patient `$everything` Operation** (`GET /fhir/v1/Patient/{id}/$everything`): Exports longitudinal patient clinical history into a single FHIR `Bundle`.
* **Standard Error Handling**: Formatted `OperationOutcome` payloads returned for 404, 400, 403, and 500 statuses.
* **Interactive FHIR Explorer**: Standalone Angular dashboard (`/fhir-explorer`) for live querying, metadata inspection, and payload ingestion.

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
