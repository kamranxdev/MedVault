# MedVault Backend - Spring Boot REST API & Security Engine

Java 17 / Spring Boot RESTful API service powering the MedVault Electronic Health Record (EHR) platform.

---

## 🏗️ Architecture & Security Model

- **Authentication & JWT**: Stateless JSON Web Token authentication (`JwtTokenProvider`) with configurable expiration and request header filtering (`JwtAuthenticationFilter`).
- **Method Security**: Spring Security `@EnableMethodSecurity` enforcing fine-grained `@PreAuthorize` role rules across all endpoints (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_AUDITOR`, `ROLE_PATIENT`).
- **Immutable WORM Audit Ledger**: `AuditLogRepository` storing append-only logs for every `READ`, `SEARCH`, `CREATE`, and `UPDATE` event across patient records (HIPAA § 164.312(b) audit control compliance).
- **Smart Allergy Safety Engine**: `SmartSafetyService` cross-referencing prescription orders against coded patient allergies (RxNorm / SNOMED CT) and detecting severe contraindications with clinician override logging.
- **Synthetic Data Generator**: `SyntheticDataService` generating realistic FHIR/Synthea-aligned patient cohorts complete with vitals, diagnoses, allergies, and encounter history.
- **FHIR R4 Interoperability Standard**: `FhirController` delivering HL7 FHIR R4 standard JSON schemas across core clinical resources.

---

## 📌 Main REST & Interoperability API Endpoints

### 🔑 Authentication & User Management
- `POST /api/auth/login`: Authenticate user credentials and return JWT bearer token.
- `POST /api/auth/register`: Register new user accounts.
- `GET /api/users/doctors`: Retrieve registered physicians for consultation dispatching.

### 👤 Master Patient Index (MPI) & Identity
- `GET /api/patients`: Retrieve Master Patient Index (`ADMIN`, `DOCTOR`, `NURSE`, `AUDITOR`).
- `GET /api/patients/search?query={q}`: Real-time search across names, SSN, MRN, phone (`ADMIN`, `DOCTOR`, `NURSE`, `AUDITOR`).
- `GET /api/patients/{id}`: Fetch demographic profile by Patient ID.
- `GET /api/patients/user/{userId}`: Retrieve patient profile linked to specific user ID (`PATIENT`).
- `POST /api/patients`: Create demographic identity profile (`ADMIN`).
- `PUT /api/patients/{id}`: Update demographics and insurance details (`ADMIN`).

### 🩺 Clinical Data Modules
- `GET /api/encounters/patient/{patientId}`: Visit history and SOAP notes.
- `POST /api/encounters`: Log new clinical encounter (`DOCTOR`, `NURSE`, `ADMIN`).
- `PUT /api/encounters/{id}`: Update clinical notes / discharge summary (`DOCTOR`, `NURSE`, `ADMIN`).
- `GET /api/prescriptions/patient/{patientId}`: Patient eRx orders.
- `POST /api/prescriptions/safety-check`: Check allergy contraindications before prescribing (`DOCTOR`).
- `POST /api/prescriptions?overrideWarning={bool}`: Prescribe medication with optional contraindication override (`DOCTOR`).
- `PUT /api/prescriptions/{id}/status`: Update eRx order status (`DOCTOR`, `NURSE`).
- `GET /api/vitals/patient/{patientId}`: Longitudinal vitals flowsheet.
- `POST /api/vitals`: Record vital signs observation (`DOCTOR`, `NURSE`).
- `GET /api/allergies/patient/{patientId}`: Coded allergy register.
- `POST /api/allergies`: Record allergen profile (`DOCTOR`, `NURSE`).
- `PUT /api/allergies/{id}/status`: Update allergy status (`DOCTOR`, `NURSE`).
- `GET /api/diagnoses/patient/{patientId}`: ICD-10 & SNOMED problem list.
- `POST /api/diagnoses`: Log medical diagnosis (`DOCTOR`).
- `PUT /api/diagnoses/{id}/status`: Resolve/update diagnosis status (`DOCTOR`).
- `GET /api/records/patient/{patientId}`: Legacy clinical records.
- `POST /api/records`: Add legacy clinical note (`DOCTOR`).
- `GET /api/appointments`: Fetch system appointments.
- `GET /api/appointments/patient/{patientId}`: Fetch patient appointments.
- `POST /api/appointments`: Schedule appointment.
- `PUT /api/appointments/{id}/status`: Update appointment status (`CANCELLED`, `COMPLETED`).

### 🛡️ Admin, Audit Ledger & Synthetic Data
- `GET /api/admin/users`: List all system users (`ADMIN`).
- `GET /api/admin/audit-logs?search={q}`: Immutable audit trail log search (`ADMIN`, `AUDITOR`).
- `POST /api/synthetic/generate`: Trigger Synthea-aligned cohort generation (`ADMIN`, `DOCTOR`).

### 🌐 HL7 FHIR R4 Interoperability API (`/fhir/v1`)
- `GET /fhir/v1/Patient`: Export FHIR Bundle of Patient resources.
- `GET /fhir/v1/Encounter?patientId={id}`: Export FHIR Bundle of Encounter resources.
- `GET /fhir/v1/AllergyIntolerance?patientId={id}`: Export FHIR Bundle of AllergyIntolerance resources.
- `GET /fhir/v1/Condition?patientId={id}`: Export FHIR Bundle of Condition (Diagnosis) resources.
- `GET /fhir/v1/MedicationRequest?patientId={id}`: Export FHIR Bundle of MedicationRequest resources.
- `GET /fhir/v1/Observation?patientId={id}`: Export FHIR Bundle of Observation (Vitals) resources.

---

## 🚀 Running & Building

```bash
# Compile project
./mvnw compile

# Run tests
./mvnw test

# Start application server (Runs on http://localhost:8080)
./mvnw spring-boot:run
```
