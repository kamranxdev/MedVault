# MedVault REST API & HL7 FHIR R4 Interoperability Guide

This document provides a comprehensive API reference for the **MedVault EHR Platform**, detailing request formats, authentication headers, response schemas, and HL7 FHIR R4 interoperability endpoints.

---

## 🔐 Authentication & Headers

All restricted API endpoints require HTTP Bearer JWT Authentication:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
```

---

## 📋 API Endpoint Catalog

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT bearer token. |
| `POST` | `/api/auth/register` | Public | Public self-registration (Strictly scoped to `ROLE_PATIENT`). |
| `POST` | `/api/auth/admin/create-user` | `ROLE_ADMIN` | Register physician or staff user with verified practice credentials. |

---

### 2. Master Patient Index & Patient Portal (`/api/patients`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_AUDITOR` | Retrieve Master Patient Index (MPI) directory. |
| `GET` | `/api/patients/search?query={q}` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE` | Search patients by Name, MRN, or SSN. |
| `GET` | `/api/patients/{id}` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_NURSE` | Retrieve detailed patient identity & clinical summary. |
| `GET` | `/api/patients/user/{userId}` | `ROLE_PATIENT` | Self-service patient portal endpoint (Strictly scoped to logged-in user). |
| `POST` | `/api/patients` | `ROLE_ADMIN` | Register new patient profile in MPI. |
| `PUT` | `/api/patients/{id}` | `ROLE_ADMIN`, `ROLE_DOCTOR` | Update patient demographic & identity fields. |

---

### 3. Prescriptions & Smart Safety Engine (`/api/prescriptions`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/prescriptions/patient/{patientId}` | `ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_PATIENT` | Retrieve active prescription history for a patient. |
| `POST` | `/api/prescriptions/validate-safety` | `ROLE_DOCTOR` | Validate medication against documented RxNorm patient allergies. |
| `POST` | `/api/prescriptions` | `ROLE_DOCTOR` | Issue eRx order (`?overrideWarning=true` required if contraindicated). |
| `PUT` | `/api/prescriptions/{id}/status` | `ROLE_DOCTOR` | Update prescription status (`ACTIVE`, `DISCONTINUED`, `COMPLETED`). |

#### Sample Request Payload: Validate Safety Check
```json
{
  "patientId": 1001,
  "medicationName": "Penicillin V Potassium",
  "dosage": "500mg",
  "instructions": "Take 1 tablet every 6 hours"
}
```

---

### 4. Synthea Synthetic Pipeline (`/api/synthetic`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/synthetic/pipeline-status` | `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_AUDITOR` | Check Synthea executable status, framework version, and DB count. |
| `POST` | `/api/synthetic/generate` | `ROLE_ADMIN`, `ROLE_DOCTOR` | Execute official Synthea CLI generator pipeline. |
| `POST` | `/api/synthetic/ingest-bundle` | `ROLE_ADMIN`, `ROLE_DOCTOR` | Ingest a raw HL7 FHIR R4 bundle JSON string. |

#### Sample Request Payload: Generate Synthea Cohort
```json
{
  "count": 3,
  "state": "Massachusetts"
}
```

---

### 5. HL7 FHIR R4 Interoperability Subsystem (`/fhir/v1`)

MedVault provides a gold-standard HL7 FHIR Release 4 RESTful API:

| Method | Endpoint | Supported Resource | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/fhir/v1/metadata` | `CapabilityStatement` | Returns official FHIR R4 conformance statement. |
| `GET` | `/fhir/v1/Patient` | `Patient` | Query FHIR Patient resources (Supports `name`, `gender`, `identifier`). |
| `GET` | `/fhir/v1/Patient/{id}` | `Patient` | Retrieve single FHIR Patient resource by ID. |
| `GET` | `/fhir/v1/Patient/{id}/$everything` | `Bundle` | Export complete patient longitudinal record into a FHIR Bundle. |
| `POST` | `/fhir/v1/Patient` | `Patient` | Ingest FHIR Patient resource into MedVault database. |
| `GET` | `/fhir/v1/Encounter` | `Encounter` | Query visit summaries formatted as FHIR Encounters. |
| `GET` | `/fhir/v1/AllergyIntolerance` | `AllergyIntolerance` | Query documented allergies with RxNorm codings. |
| `GET` | `/fhir/v1/Condition` | `Condition` | Query problem list items with ICD-10 & SNOMED CT codings. |
| `GET` | `/fhir/v1/MedicationRequest` | `MedicationRequest` | Query active eRx orders formatted as FHIR MedicationRequests. |
| `GET` | `/fhir/v1/Observation` | `Observation` | Query LOINC-coded vital sign flowsheets. |

#### Sample FHIR R4 Error Outcome Response (`OperationOutcome`)
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "diagnostics": "Patient record with ID 9999 was not found."
    }
  ]
}
```
