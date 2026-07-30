# MedVault Frontend - Angular Enterprise EHR Interface

Modern, standalone Angular enterprise web application featuring role-tailored clinical workspaces, a public landing page, a split-screen 2-column login interface, and global reactive patient context management.

---

## 🌟 Key Features & Workspaces

- **Public Landing Page (`/`)**: Hero section, system features showcase, 5 clinical workspace cards, and top navigation bar with direct "Sign In" button.
- **Redesigned Split 2-Column Login (`/login`)**:
  - **Left Column**: Visual architectural backdrop image with MedVault branding overlay.
  - **Right Column**: Persona demo switcher (1-click login for Patient, Doctor, Nurse, Admin, Auditor) and manual credential sign-in.
  - **Back to Home**: Easy navigation link back to `/`.
- **Global Patient Context (`PatientContextService`)**:
  - Automatically loads and locks patient data for `ROLE_PATIENT`.
  - Provides a sticky **Active Patient Context Banner** at the top of the app for Clinicians (`ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_ADMIN`).
- **Role-Tailored Workspaces**:
  - **Dashboard (`/dashboard`)**: Custom summary view per role (Patient Summary vs Physician Desk vs Nursing Station vs Admin Center).
  - **Patients (`/patients`)**: Master Patient Index (MPI) with real-time search for staff; read-only profile for patients.
  - **Encounters (`/encounters`)**: Outpatient & Inpatient visit log, SOAP clinical notes, and discharge summaries.
  - **Prescriptions (`/prescriptions`)**: eRx order entry with Smart Allergy contraindications alert modal & clinician override option.
  - **Vitals (`/vitals`)**: Time-series BP, HR, Temp, SpO2, BMI, and Glucose flowsheet with status indicators.
  - **Allergies (`/allergies`)**: RxNorm/SNOMED-coded adverse reaction register.
  - **Diagnoses (`/diagnoses`)**: ICD-10 & SNOMED-CT problem list management with status toggling (Active / Resolved).
  - **Medical Records (`/records`)**: Legacy clinical notes and medical history viewer.
  - **Appointments (`/appointments`)**: Schedule consultations with specific physicians (`Dr. Mahtab Khan` vs `Dr. Rajesh Sharma`).
  - **Audit Ledger (`/audit-ledger`)**: HIPAA § 164.312(b) audit trail viewer with real-time query filter for Administrators and Auditors.
  - **Admin Control Center (`/admin`)**: User account directory and 1-click Synthetic Patient Cohort generator.

---

## 🛠️ Architecture & Core Services

- **Framework**: Angular 19+ (Standalone Components, Signals, Reactive Forms).
- **Security Guards**:
  - `authGuard`: Route protection checking JWT token presence and session validity.
  - `roleGuard`: Enforces fine-grained role-based navigation access control (RBAC).
- **HTTP Interceptors**:
  - `jwtInterceptor`: Automatically attaches `Authorization: Bearer <token>` headers to backend REST (`/api/*`) and FHIR (`/fhir/*`) calls.
- **Core Services**:
  - `AuthService`: Token management, user role decoding, and login/logout state lifecycle.
  - `PatientContextService`: Global active patient selection and context broadcasting across clinical modules.
  - `ApiService`: Centralized HTTP client wrapping all backend REST and FHIR endpoints.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local dev server (Runs on http://localhost:4200)
HOME=/mnt/workspace/MedVault/frontend npx ng serve
```

---

## 🛠️ Production Build Command

```bash
HOME=/mnt/workspace/MedVault/frontend npx ng build
```
Build output stored in `dist/frontend`.

