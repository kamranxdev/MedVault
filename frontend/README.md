# MedVault Frontend - Angular Enterprise EHR Interface

Modern standalone Angular enterprise application featuring role-tailored clinical workspaces, a public landing page, a split-screen login interface, and global reactive patient context management.

---

## 🌟 Key Workspaces & Modules

- **Public Landing Page (`/`)**: Hero section, system features showcase, clinical workspace cards, and top navigation bar.
- **Split-Screen Sign-In (`/login`)**:
  - **Left**: Medical architecture backdrop image.
  - **Right**: 1-click persona demo switcher (Patient, Doctor, Nurse, Admin, Auditor) and manual login form.
- **Global Patient Context (`PatientContextService`)**:
  - Auto-locks patient data for logged-in patients (`ROLE_PATIENT`).
  - Active Patient Context Banner for clinicians (`ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_ADMIN`).
- **Clinical Workspaces**:
  - **Dashboard (`/dashboard`)**: Summary view tailored per role.
  - **Patients (`/patients`)**: Master Patient Index (MPI) with real-time search.
  - **Encounters (`/encounters`)**: Outpatient & Inpatient visit log, SOAP notes, discharge summaries.
  - **Prescriptions (`/prescriptions`)**: eRx orders with Smart Allergy contraindications modal & clinician override option.
  - **Vitals (`/vitals`)**: Longitudinal vitals flowsheet with clinical indicators.
  - **Allergies (`/allergies`)**: RxNorm/SNOMED-coded adverse reaction register.
  - **Diagnoses (`/diagnoses`)**: ICD-10 & SNOMED-CT problem list management.
  - **Medical Records (`/records`)**: Legacy clinical notes and medical history.
  - **Appointments (`/appointments`)**: Schedule consultations with physicians.
  - **Audit Ledger (`/audit-ledger`)**: HIPAA § 164.312(b) audit trail viewer with query filters.
  - **Admin Control Center (`/admin`)**: User directory and Synthetic Cohort generator.

---

## 🛠️ Tech Architecture

- **Framework**: Angular 19+ (Standalone Components, Signals, Reactive Forms).
- **Guards**: `authGuard` (Route protection), `roleGuard` (RBAC navigation control).
- **Interceptors**: `jwtInterceptor` (Attaches `Authorization: Bearer <token>` to REST and FHIR calls).
- **Services**: `AuthService`, `PatientContextService`, `ApiService`.

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start local server (http://localhost:4200)
npm start

# Production Build
npm run build
```
