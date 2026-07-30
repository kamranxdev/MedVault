# MedVault Backend - Spring Boot REST API & Security Engine

Java 17 / Spring Boot RESTful API service powering the MedVault Electronic Health Record (EHR) platform.

---

## 🏗️ Architecture & Security Model

- **Authentication & JWT**: Stateless JSON Web Token authentication (`JwtTokenProvider`) with configurable expiration.
- **Method Security**: Spring Security `@EnableMethodSecurity` enforcing `@PreAuthorize` role rules across all endpoints.
- **Immutable WORM Audit Ledger**: `AuditLogRepository` storing append-only logs for every read, search, update, and creation event (HIPAA § 164.312(b)).
- **Smart Allergy Safety Engine**: `SmartSafetyService` cross-referencing prescription orders against coded patient allergies (RxNorm).
- **Synthetic Data Generator**: `SyntheticDataService` generating realistic FHIR R4 clinical cohorts.

---

## 📌 Main REST API Endpoints

### Authentication & Users
- `POST /api/auth/login`: Authenticate user and receive JWT.
- `POST /api/auth/register`: Register new user.
- `GET /api/users/doctors`: Retrieve all registered physicians for appointment dispatching.

### Patient Index & Data Scoping
- `GET /api/patients`: Master Patient Index (Requires `ADMIN`, `DOCTOR`, `NURSE`, or `AUDITOR`).
- `GET /api/patients/user/{userId}`: Retrieve patient linked to specific user account (Allowed for `PATIENT`).
- `GET /api/patients/{id}`: Demographic profile by Patient ID.

### Clinical Data Modules
- `GET /api/prescriptions/patient/{patientId}`: Patient eRx orders.
- `POST /api/prescriptions/safety-check`: Check allergy contraindications.
- `GET /api/vitals/patient/{patientId}`: Longitudinal vitals.
- `GET /api/allergies/patient/{patientId}`: Coded allergies.
- `GET /api/diagnoses/patient/{patientId}`: ICD-10 problem list.
- `GET /api/appointments`: Appointment calendar.

---

## 🚀 Running & Building

```bash
# Compile project
./mvnw compile

# Run tests
./mvnw test

# Start application server
./mvnw spring-boot:run
```
