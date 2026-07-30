# MedVault Enterprise EHR Platform

> **FHIR R4 & HIPAA § 164.312 Compliant Electronic Health Record (EHR) & Clinical Management System**

MedVault is a production-grade, enterprise-scale Electronic Health Record (EHR) platform engineered with individual patient data scoping, multi-persona clinical workspaces, real-time Smart Allergy contraindication checking, and immutable WORM compliance logging.

---

## 🌟 Key Highlights & Architectural Features

- **🌐 Public Landing Page**: High-impact enterprise landing page showcasing system capabilities, FHIR R4 interoperability, and instant navigation to role portals.
- **🖼️ Modern 2-Column Split Login**: Split-screen design with dynamic visual medical backdrop, 1-click persona demo switcher, and secure credential sign-in.
- **🔒 Individual Patient Portal & Data Scoping**: Logged-in patients (`ROLE_PATIENT`) are strictly bound to their personal patient profile (`/api/patients/user/{userId}`). Universal patient dropdowns and Master Patient Index (MPI) lists are hidden from patients to enforce HIPAA isolation.
- **🩺 Physician Desk Workspace**: Tailored workspace for doctors (`ROLE_DOCTOR`) with SOAP progress notes, ICD-10 problem lists, eRx orders, and consultation scheduling.
- **💉 Nurse Station Flowsheet**: Time-series bedside vitals flowsheet logging (BP, HR, Temp, Glucose, SpO2, BMI) and Medication Administration Record (MAR).
- **⚙️ Admin & Intake Command Center**: Master Patient Index (MPI) registration, user RBAC management, and appointment dispatching.
- **🛡️ HIPAA WORM Compliance Vault**: Immutable append-only audit ledger tracking every read/write/access action per HIPAA § 164.312(b).
- **⚠️ Smart Allergy Safety Engine**: Real-time RxNorm allergy contraindication engine cross-checking active prescriptions against patient allergies before issuance.

---

## 🔑 Pre-Configured Demo Credentials Matrix

The system seeds individual user accounts for patients, doctors, nurses, administrators, and compliance auditors:

| Persona Role | Username | Password | Full Name & Specialty / MRN | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Patient 1** | `user_eleanor` | `patient123` | **Eleanor Vance** (`PAT-1001`) | Personal Health Summary, Type 2 Diabetes, Penicillin Allergy, Prescriptions |
| **Patient 2** | `user_robert` | `patient123` | **Robert Chen** (`PAT-1002`) | Personal Health Summary, Essential Hypertension, Lisinopril |
| **Patient 3** | `user_sophia` | `patient123` | **Sophia Martinez** (`PAT-1003`) | Personal Health Summary, Latex Allergy |
| **Doctor (Cardiology)**| `doctor_jenkins` | `doctor123` | **Dr. Sarah Jenkins** (Cardiology) | Physician Desk, SOAP Notes, eRx Orders, Safety Overrides |
| **Doctor (Neurology)**| `doctor_marcus` | `doctor123` | **Dr. Marcus Vance** (Neurology) | Physician Desk, Neurology Consultations, Schedule |
| **Clinical Nurse** | `nurse_clara` | `nurse123` | **Nurse Clara Barton** (ICU/Emergency) | Bedside Vitals Flowsheet, MAR Tracking, Ward Census |
| **Hospital Admin** | `admin` | `admin123` | **Dr. Alexander Wright** (Admin) | MPI Registration, RBAC Management, Appointment Dispatch |
| **Compliance Auditor**| `auditor` | `auditor123` | **Inspector Vance** (Auditor) | Read-Only WORM Audit Vault, HIPAA Forensic Exporter |

---

## 🏗️ Technology Stack

### Frontend Architecture
- **Framework**: Angular 19+ (Standalone Components, Signals, Reactive State)
- **Styling**: Modern Vanilla TailwindCSS CSS utilities with custom HSL dark mode token system
- **State & Context**: `PatientContextService` providing global reactive patient context management

### Backend Architecture
- **Framework**: Java 17 / Spring Boot 3.2+
- **Security**: Spring Security 6 with Stateless JWT Authentication & `@PreAuthorize` Method Security
- **Database**: H2 In-Memory / Relational JPA Entity Mapping
- **Audit Engine**: Immutable WORM Ledger (`AuditLogRepository`)

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
*The REST API will start at `http://localhost:8080`.*

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

---

## 📁 Repository Directory Structure

```
MedVault/
├── backend/                  # Spring Boot REST API & Security
│   ├── src/main/java/com/medvault/
│   │   ├── config/           # DataSeeder & App Configuration
│   │   ├── controller/       # REST Endpoints (Patients, Prescriptions, Vitals, Users)
│   │   ├── model/            # JPA Entities (User, Patient, Prescription, Vitals, Allergy)
│   │   ├── repository/       # Data Access Repositories & WORM Audit Logs
│   │   ├── security/         # JWT Auth Filters, Custom UserDetails, SecurityConfig
│   │   └── service/          # SmartSafetyService & Synthetic Data Engine
│   └── pom.xml
│
├── frontend/                 # Angular Standalone Enterprise UI
│   ├── src/app/
│   │   ├── components/       # Landing Page, Split Login, Dashboard, Patients, Prescriptions...
│   │   ├── core/             # PatientContextService, AuthService, ApiService, Guards, Models
│   │   ├── app.ts            # Root Layout & Active Patient Top Bar
│   │   └── app.routes.ts     # Route Definitions
│   └── public/assets/images/ # High-resolution hero image assets
│
└── docker-compose.yml
```

---

## 📄 License & Compliance

Designed & Maintained by Senior Software Engineering & Healthcare Systems Specialists.  
Complies with **HIPAA Security Rule § 164.312** & **HL7 FHIR R4 Specification**.
