# MedVault Enterprise EHR Platform

> **HL7 FHIR R4 & HIPAA § 164.312 Compliant Electronic Health Record (EHR) & Clinical Management System**

MedVault is a production-grade, enterprise-scale Electronic Health Record (EHR) platform engineered with individual patient data scoping, multi-persona clinical workspaces, real-time Smart Allergy contraindication checking, an immutable WORM audit log engine, and HL7 FHIR R4 interoperability APIs.

---

## 🌟 Key Highlights & Architectural Features

- **🌐 Public Landing Page (`/`)**: High-impact enterprise landing page showcasing clinical workspace capabilities, system security, and direct portal access.
- **🖼️ Split 2-Column Login (`/login`)**: Split-screen design with custom medical architecture branding, 1-click persona demo switcher, and credential sign-in.
- **🔒 Individual Patient Portal & Data Scoping**: Logged-in patients (`ROLE_PATIENT`) are strictly bound to their personal patient profile (`/api/patients/user/{userId}`). Patient dropdowns and Master Patient Index (MPI) lists are hidden from patients to enforce HIPAA isolation.
- **🩺 Physician Desk Workspace (`/dashboard`, `/encounters`, `/diagnoses`)**: Tailored workspace for doctors (`ROLE_DOCTOR`) featuring SOAP progress notes, ICD-10 & SNOMED-CT problem lists, eRx orders with safety check overrides, and consultation scheduling.
- **💉 Bedside Nurse Flowsheet (`/vitals`, `/encounters`)**: Longitudinal vitals flowsheet tracking Blood Pressure, Heart Rate, Temperature, Glucose, SpO2, and BMI with clinical status badges.
- **⚙️ Admin & Intake Command Center (`/admin`, `/patients`)**: Master Patient Index (MPI) registration, user RBAC account directory, and 1-click Synthea-aligned synthetic cohort generator.
- **🛡️ HIPAA WORM Compliance Vault (`/audit-ledger`)**: Immutable append-only audit ledger tracking every `READ`, `SEARCH`, `CREATE`, and `UPDATE` action per HIPAA § 164.312(b) with real-time log search.
- **⚠️ Smart Allergy Safety Engine**: Real-time RxNorm/SNOMED allergy contraindication engine cross-checking active prescriptions against patient allergies before issuance with clinician override logging.
- **🌐 HL7 FHIR R4 Interoperability API (`/fhir/v1/*`)**: HL7 FHIR R4 compliant REST endpoints for exporting standard JSON resources (`Patient`, `Encounter`, `AllergyIntolerance`, `Condition`, `MedicationRequest`, `Observation`).

---

## 🔑 Pre-Configured Demo Credentials Matrix

The system seeds pre-configured user accounts for patients, physicians, nurses, administrators, and compliance auditors:

| Persona Role | Username | Password | Full Name & Specialty / MRN | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Patient 1** | `user_kamran` | `patient123` | **Kamran Khan** (`PAT-1001`) | Personal Health Summary, Type 2 Diabetes, Penicillin Allergy, Prescriptions |
| **Patient 2** | `user_aarav` | `patient123` | **Aarav Patel** (`PAT-1002`) | Personal Health Summary, Essential Hypertension, Lisinopril |
| **Patient 3** | `user_ananya` | `patient123` | **Ananya Sharma** (`PAT-1003`) | Personal Health Summary, Latex Allergy |
| **Doctor (Cardiology)**| `doctor_mahtab` | `doctor123` | **Dr. Mahtab Khan** (Cardiology) | Physician Desk, SOAP Notes, eRx Orders, Safety Overrides |
| **Doctor (Neurology)**| `doctor_rajesh` | `doctor123` | **Dr. Rajesh Sharma** (Neurology) | Physician Desk, Neurology Consultations, Schedule |
| **Clinical Nurse** | `nurse_priya` | `nurse123` | **Nurse Priya Verma** (ICU/Emergency) | Bedside Vitals Flowsheet, Encounter Logs, Ward Census |
| **Hospital Admin** | `admin` | `admin123` | **Dr. Vikramaditya Gupta** (Admin) | MPI Registration, RBAC Management, Synthetic Data Generation |
| **Compliance Auditor**| `auditor` | `auditor123` | **Inspector Suresh Menon** (Auditor) | Read-Only WORM Audit Vault, HIPAA Forensic Exporter |

---

## 🏗️ Technology Stack

### Frontend Architecture
- **Framework**: Angular 19+ (Standalone Components, Signals, Reactive State Management)
- **Styling**: Modern Vanilla CSS design system with custom HSL tokens, dark mode, glassmorphism, and responsive layouts
- **State & Context**: `PatientContextService` providing global reactive patient context management
- **Guards & Interceptors**: `authGuard`, `roleGuard` (RBAC), and `jwtInterceptor` (Bearer token injection)

### Backend Architecture
- **Framework**: Java 17 / Spring Boot 3.2+
- **Security**: Spring Security 6 with Stateless JWT Authentication & `@PreAuthorize` Method Security
- **Database Layer**: JPA/Hibernate with relational mapping and H2 database engine
- **Audit Engine**: Immutable WORM Ledger (`AuditLogRepository`) logging all data access events
- **Interoperability**: HL7 FHIR R4 standard JSON serializers (`FhirController`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Java JDK**: JDK 17+
- **Maven**: Included via `./mvnw` wrapper

### 1. Running the Backend Server
```bash
cd backend
./mvnw spring-boot:run
```
*The REST API and FHIR services will start at `http://localhost:8080`.*

### 2. Running the Frontend Application
```bash
cd frontend
npm install
HOME=/mnt/workspace/MedVault/frontend npx ng serve
```
*Open your browser at `http://localhost:4200` to view the Landing Page and EHR Portal.*

---

## 🧪 Build & Test Commands

### Backend Compilation & Tests
```bash
cd backend
./mvnw compile
./mvnw test
```

### Frontend Build
```bash
cd frontend
HOME=/mnt/workspace/MedVault/frontend npx ng build
```
Build output saved in `frontend/dist/frontend`.

---

## 📁 Repository Directory Structure

```
MedVault/
├── backend/                  # Spring Boot REST API, Security & FHIR Engine
│   ├── src/main/java/com/medvault/
│   │   ├── config/           # DataSeeder & App Security Setup
│   │   ├── controller/       # REST Endpoints (Patients, Prescriptions, Vitals, Encounters, FHIR R4)
│   │   ├── dto/              # Auth & JWT Payload DTOs
│   │   ├── model/            # JPA Entities (User, Patient, Prescription, Vitals, Allergy, Encounter)
│   │   ├── repository/       # Repositories & WORM Audit Log Storage
│   │   ├── security/         # JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig
│   │   └── service/          # SmartSafetyService & SyntheticDataService
│   ├── pom.xml
│   └── README.md
│
├── frontend/                 # Angular Standalone Enterprise UI
│   ├── src/app/
│   │   ├── components/       # Landing, Login, Dashboard, Patients, Prescriptions, Vitals, Audit Ledger...
│   │   ├── core/             # PatientContextService, AuthService, ApiService, Guards, Models
│   │   ├── app.ts            # Root Component & Active Patient Banner
│   │   └── app.routes.ts     # Route Definitions & RBAC Guards
│   └── README.md
│
└── README.md                 # Master Project Overview
```

---

## 📄 License & Compliance

Designed & Maintained by Senior Software Engineering & Healthcare Systems Specialists.  
Complies with **HIPAA Security Rule § 164.312** & **HL7 FHIR R4 Specification**.

