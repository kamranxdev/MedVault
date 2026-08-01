# MedVault Enterprise EHR Platform

> **HL7 FHIR R4 & HIPAA § 164.312 Compliant Electronic Health Record (EHR) & Clinical Management System**

MedVault is an enterprise-scale Electronic Health Record (EHR) platform built with standalone Angular frontend, Spring Boot backend, individual patient data scoping, multi-persona clinical workspaces, real-time Smart Allergy safety engine, HIPAA WORM audit log, and HL7 FHIR R4 interoperability APIs.

---

## 🌟 Key Highlights & Features

- **🌐 Enterprise Landing Page (`/`)**: Overview of clinical features, compliance standards, and direct portal access.
- **🖼️ Split-Screen Sign-In (`/login`)**: Built-in 1-click persona switcher and standard credential sign-in.
- **🔒 HIPAA Scoped Patient Portal**: Logged-in patients (`ROLE_PATIENT`) are strictly scoped to their personal health summary (`/api/patients/user/{userId}`).
- **🩺 Physician Desk (`/dashboard`, `/encounters`, `/diagnoses`)**: SOAP progress notes, ICD-10 & SNOMED-CT problem lists, eRx orders with allergy check overrides.
- **💉 Bedside Nurse Flowsheet (`/vitals`, `/encounters`)**: Longitudinal vitals tracking (BP, HR, Temp, SpO2, Glucose, BMI).
- **⚙️ Admin Command Center (`/admin`, `/patients`)**: Master Patient Index (MPI), user RBAC directory, and 1-click Synthea-aligned synthetic cohort generator.
- **🛡️ HIPAA WORM Compliance Vault (`/audit-ledger`)**: Immutable append-only audit ledger tracking every data action per HIPAA § 164.312(b).
- **⚠️ Smart Allergy Safety Engine**: Real-time RxNorm/SNOMED contraindication cross-checking before prescription issuance.
- **🌐 HL7 FHIR R4 Interoperability API (`/fhir/v1/*`)**: JSON endpoints exporting standard FHIR resources (`Patient`, `Encounter`, `AllergyIntolerance`, `Condition`, `MedicationRequest`, `Observation`).

---

## 🔑 Pre-Configured Demo Credentials

| Role | Username | Password | User Profile | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Patient 1** | `user_kamran` | `patient123` | **Kamran Khan** (`PAT-1001`) | Personal Health Summary, Type 2 Diabetes, Penicillin Allergy |
| **Patient 2** | `user_aarav` | `patient123` | **Aarav Patel** (`PAT-1002`) | Personal Health Summary, Essential Hypertension |
| **Patient 3** | `user_ananya` | `patient123` | **Ananya Sharma** (`PAT-1003`) | Personal Health Summary, Latex Allergy |
| **Doctor (Cardiology)**| `doctor_mahtab` | `doctor123` | **Dr. Mahtab Khan** | Physician Desk, SOAP Notes, eRx Safety Overrides |
| **Doctor (Neurology)**| `doctor_rajesh` | `doctor123` | **Dr. Rajesh Sharma** | Physician Desk, Neurology Consultations |
| **Clinical Nurse** | `nurse_priya` | `nurse123` | **Nurse Priya Verma** | Bedside Vitals Flowsheet, Encounter Logs |
| **Hospital Admin** | `admin` | `admin123` | **Dr. Vikramaditya Gupta** | MPI Registration, RBAC, Synthetic Cohort Generator |
| **Compliance Auditor**| `auditor` | `auditor123` | **Inspector Suresh Menon** | Read-Only WORM Audit Vault |

---

## 🏗️ Technology Stack

- **Frontend**: Angular 19+ (Standalone Components, Signals, Reactive Forms, Vanilla CSS system).
- **Backend**: Java 17 / Spring Boot 3.2+, Spring Security 6 (Stateless JWT Authentication & `@PreAuthorize` Method Security).
- **Database & Data**: Relational JPA/Hibernate. Database table creation and seed data provided via standard SQL scripts (`schema.sql`, `seed.sql`).
- **Containerization**: Docker Compose service for `medvault-oracle-db`.

---

## 🚀 Quick Start

### 1. Database Setup (Docker or Local Database)

### 1. Database Setup (Docker or Local Database)

**Option 1: Automatic Execution via Docker Container (Recommended)**
```bash
docker compose up -d
```
*`docker-compose.yml` mounts `backend/schema.sql` and `backend/seed.sql` into `/container-entrypoint-initdb.d/`, automatically creating tables and populating seed data when the database container starts.*

**Option 2: Manual Execution via Docker CLI**
```bash
# 1. Create tables (DDL)
docker exec -i medvault-oracle-db sqlplus system/Oracle123!@FREEPDB1 < backend/schema.sql

# 2. Populate seed data (DML)
docker exec -i medvault-oracle-db sqlplus system/Oracle123!@FREEPDB1 < backend/seed.sql
```

**Option 3: GUI SQL Editor (DBeaver / Oracle SQL Developer)**
- **Host**: `localhost` | **Port**: `1521` | **Service Name**: `FREEPDB1`
- **Username**: `system` (or `medvault`) | **Password**: `Oracle123!` (or `MedVaultPass123!`)
- Open and run `backend/schema.sql` followed by `backend/seed.sql`.

### 2. Backend Server
```bash
cd backend
./mvnw spring-boot:run
```
*API runs at `http://localhost:8080`*

### 3. Frontend Web App
```bash
cd frontend
npm install
npm start
```
*App runs at `http://localhost:4200`*

---

## 🧪 Build & Verification Commands

```bash
# Backend Build & Test
cd backend
./mvnw compile
./mvnw test

# Frontend Production Build
cd frontend
npm run build
```

---

## 📁 Repository Directory Structure

```
MedVault/
├── backend/                  # Spring Boot REST API & Security Engine
│   ├── schema.sql            # Database DDL table definitions
│   ├── seed.sql              # Database DML initial seed data
│   ├── src/                  # Source code
│   └── pom.xml
│
├── frontend/                 # Angular Standalone Enterprise UI
│   ├── src/                  # Components, Services, Guards, Routes
│   └── package.json
│
├── docker-compose.yml        # Docker setup for database container (medvault-oracle-db)
└── README.md                 # Master Project Overview
```
