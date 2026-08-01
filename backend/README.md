# MedVault Backend - Spring Boot REST API & Security Engine

Java 17 / Spring Boot RESTful API service powering the MedVault Electronic Health Record (EHR) platform.

---

## 🏗️ Core Components

- **Authentication & JWT**: Stateless JSON Web Token authentication (`JwtTokenProvider`) and security filter (`JwtAuthenticationFilter`).
- **Method Security**: Spring Security `@EnableMethodSecurity` with fine-grained `@PreAuthorize` rules (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_AUDITOR`, `ROLE_PATIENT`).
- **Immutable WORM Audit Ledger**: `AuditLogRepository` storing append-only logs for HIPAA § 164.312(b) audit compliance.
- **Smart Allergy Safety Engine**: `SmartSafetyService` cross-referencing eRx orders against coded patient allergies (RxNorm / SNOMED CT) with clinician override logging.
- **Synthetic Cohort Generator**: `SyntheticDataService` generating realistic FHIR/Synthea-aligned patient cohorts.
- **HL7 FHIR R4 Interoperability**: `FhirController` delivering HL7 FHIR R4 standard JSON resources.

---

## 💾 Database Scripts & Setup

- **`schema.sql`**: Table creation DDL statements.
- **`seed.sql`**: Initial sample dataset (roles, default users, patients, vitals, prescriptions, encounters, audit logs).

### Database Execution Options:
1. **Automatic via Docker**:
   ```bash
   docker compose up -d
   ```
   *Automatically runs `schema.sql` and `seed.sql` on container startup via `/container-entrypoint-initdb.d/`.*

2. **Manual via Docker CLI**:
   ```bash
   docker exec -i medvault-oracle-db sqlplus system/Oracle123!@FREEPDB1 < backend/schema.sql
   docker exec -i medvault-oracle-db sqlplus system/Oracle123!@FREEPDB1 < backend/seed.sql
   ```

3. **Manual via SQL Editor** (DBeaver / Oracle SQL Developer):
   - **Host**: `localhost` | **Port**: `1521` | **Service**: `FREEPDB1`
   - Run `schema.sql` followed by `seed.sql`.

---

## 📌 Main REST & Interoperability API Endpoints

### 🔑 Authentication & Users
- `POST /api/auth/login`: Authenticate credentials & return JWT bearer token.
- `POST /api/auth/register`: User registration.
- `GET /api/users/doctors`: List registered physicians.

### 👤 Master Patient Index (MPI)
- `GET /api/patients`: Master Patient Index (`ADMIN`, `DOCTOR`, `NURSE`, `AUDITOR`).
- `GET /api/patients/search?query={q}`: Search by name, SSN, MRN, phone.
- `GET /api/patients/{id}`: Fetch patient by ID.
- `GET /api/patients/user/{userId}`: Retrieve patient linked to user account (`PATIENT`).
- `POST /api/patients`: Create patient profile (`ADMIN`).

### 🩺 Clinical Operations
- `GET /api/encounters/patient/{patientId}`: Visit history and SOAP notes.
- `POST /api/encounters`: Record clinical encounter (`DOCTOR`, `NURSE`, `ADMIN`).
- `GET /api/prescriptions/patient/{patientId}`: eRx orders.
- `POST /api/prescriptions/safety-check`: Check allergy contraindications (`DOCTOR`).
- `POST /api/prescriptions?overrideWarning={bool}`: Prescribe medication with safety check override (`DOCTOR`).
- `GET /api/vitals/patient/{patientId}`: Longitudinal vitals flowsheet.
- `POST /api/vitals`: Record vital signs (`DOCTOR`, `NURSE`).
- `GET /api/allergies/patient/{patientId}`: Allergy register.
- `POST /api/allergies`: Record allergen (`DOCTOR`, `NURSE`).
- `GET /api/diagnoses/patient/{patientId}`: Problem list (ICD-10 / SNOMED).
- `POST /api/diagnoses`: Log medical diagnosis (`DOCTOR`).
- `GET /api/appointments`: Fetch appointments.
- `POST /api/appointments`: Schedule appointment.

### 🛡️ Audit Ledger & Synthetic Data
- `GET /api/admin/audit-logs?search={q}`: Immutable audit trail log search (`ADMIN`, `AUDITOR`).
- `POST /api/synthetic/generate`: Trigger synthetic cohort generation (`ADMIN`, `DOCTOR`).

### 🌐 HL7 FHIR R4 API (`/fhir/v1`)
- `GET /fhir/v1/Patient`: Export FHIR Patient bundle.
- `GET /fhir/v1/Encounter?patientId={id}`: Export FHIR Encounter bundle.
- `GET /fhir/v1/AllergyIntolerance?patientId={id}`: Export FHIR AllergyIntolerance bundle.
- `GET /fhir/v1/Condition?patientId={id}`: Export FHIR Condition bundle.
- `GET /fhir/v1/MedicationRequest?patientId={id}`: Export FHIR MedicationRequest bundle.
- `GET /fhir/v1/Observation?patientId={id}`: Export FHIR Observation bundle.

---

## 🚀 Running & Building

```bash
# Compile project
./mvnw compile

# Run unit tests
./mvnw test

# Start server (http://localhost:8080)
./mvnw spring-boot:run
```
