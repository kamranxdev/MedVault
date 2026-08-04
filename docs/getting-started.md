# MedVault Getting Started & Developer Setup Guide

This guide provides step-by-step instructions for setting up, executing, and testing the **MedVault EHR Platform** across local, containerized, and cloud execution environments.

---

## 🛠️ Prerequisites

Ensure your development workstation has the following tools installed:

- **Java Development Kit (JDK)**: OpenJDK 17 or Java 21 LTS (`java -version`).
- **Node.js & NPM**: Node.js v18.0+ & NPM v9.0+ (`node -v` & `npm -v`).
- **Docker & Docker Compose**: Optional for containerized PostgreSQL deployment (`docker compose version`).

---

## 🔑 Pre-Configured Demo Credentials Matrix

MedVault provides pre-seeded accounts representing real-world healthcare roles:

| Role | Username | Password | User Profile | Primary Workspace & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Patient 1** | `user_kamran` | `patient123` | **Kamran Khan** (`PAT-1001`) | Personal Health Portal (`/patient-portal`), Type 2 Diabetes, Penicillin Allergy |
| **Patient 2** | `user_aarav` | `patient123` | **Aarav Patel** (`PAT-1002`) | Personal Health Portal (`/patient-portal`), Essential Hypertension |
| **Patient 3** | `user_ananya` | `patient123` | **Ananya Sharma** (`PAT-1003`) | Personal Health Portal (`/patient-portal`), Latex Allergy |
| **Doctor (Cardiology)**| `doctor_mahtab` | `doctor123` | **Dr. Mahtab Khan** | Physician Desk (`/dashboard`), SOAP Progress Notes, eRx Safety Overrides |
| **Doctor (Neurology)**| `doctor_rajesh` | `doctor123` | **Dr. Rajesh Sharma** | Physician Desk (`/dashboard`), Neurology Consultations |
| **Clinical Nurse** | `nurse_priya` | `nurse123` | **Nurse Priya Verma** | Bedside Vitals Flowsheet (`/vitals`), Encounter Logs |
| **Hospital Admin** | `admin` | `admin123` | **Dr. Vikramaditya Gupta** | Admin Command Center (`/admin`), Master Patient Index, Synthea Pipeline |
| **Compliance Auditor**| `auditor` | `auditor123` | **Inspector Suresh Menon** | Read-Only WORM Audit Vault (`/audit-ledger`), Forensic Reports |

---

## 🚀 Execution Environment Options

MedVault supports 3 database execution options without requiring code changes:

### Option 1: Standalone In-Memory H2 DB (Zero Setup - Default)

Instant local execution using embedded H2 PostgreSQL mode.
```bash
# 1. Start Backend API (Port 8080)
cd backend
./mvnw spring-boot:run
```
- **H2 Interactive Web Console**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:medvaultdb`
  - **User Name**: `sa`
  - **Password**: *(leave blank)*

```bash
# 2. Start Frontend Web App (Port 4200)
cd frontend
npm install
npm start
```

---

### Option 2: Local PostgreSQL 16 Container (Docker Compose)

1. Start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```
2. Start the backend connected to the local container:
   ```bash
   cd backend
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/medvault \
   SPRING_DATASOURCE_DRIVER=org.postgresql.Driver \
   SPRING_DATASOURCE_USERNAME=medvault \
   SPRING_DATASOURCE_PASSWORD=MedVaultPass123! \
   SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect \
   ./mvnw spring-boot:run
   ```

---

### Option 3: Cloud PostgreSQL (Supabase / AWS RDS / GCP Cloud SQL)

Set environment variables with your cloud connection string:
```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
export SPRING_DATASOURCE_DRIVER="org.postgresql.Driver"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="YourPassword123!"
export SPRING_JPA_DATABASE_PLATFORM="org.hibernate.dialect.PostgreSQLDialect"

cd backend
./mvnw spring-boot:run
```

---

## 🧪 Build & Testing Commands

```bash
# Backend Compilation & Automated Test Suite
cd backend
./mvnw compile
./mvnw test

# Run Synthea Synthetic Data Pipeline Script
./scripts/run_synthea_pipeline.sh 5 Massachusetts

# Frontend Production Build
cd frontend
npm run build
```
