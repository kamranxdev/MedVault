# MedVault Frontend - Angular Enterprise EHR Interface

Modern, standalone Angular enterprise web application featuring role-tailored clinical workspaces, a public landing page, a split-screen 2-column login interface, and global reactive patient context management.

---

## 🌟 Key Features

- **Public Landing Page (`/`)**: Hero section, system features showcase, 5 clinical workspace cards, and top navigation bar with a direct "Sign In" button.
- **Redesigned Split 2-Column Login (`/login`)**:
  - **Left Column**: Visual architectural backdrop image with MedVault branding overlay.
  - **Right Column**: Persona demo switcher (1-click login for every individual Patient, Doctor, Nurse, Admin, Auditor) and manual credential sign-in.
  - **Back to Home**: Easy navigation link back to `/`.
- **Global Patient Context (`PatientContextService`)**:
  - Automatically loads and locks patient data for `ROLE_PATIENT`.
  - Provides a sticky **Active Patient Context Banner** at the top of the app for Clinicians (`ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_ADMIN`).
- **Role-Tailored Workspaces**:
  - **Dashboard (`/dashboard`)**: Custom view per role (Individual Patient Summary vs Physician Desk vs Nursing Station vs Admin Center).
  - **Patients (`/patients`)**: Master Patient Index (MPI) with search for staff; read-only profile for patients.
  - **Prescriptions (`/prescriptions`)**: eRx order entry with Smart Allergy contraindications alert modal.
  - **Vitals (`/vitals`)**: Time-series BP, HR, Glucose, SpO2 flowsheet.
  - **Allergies (`/allergies`)**: RxNorm/SNOMED coded adverse reaction register.
  - **Diagnoses (`/diagnoses`)**: ICD-10 problem list management.
  - **Appointments (`/appointments`)**: Schedule consultations with specific doctors (`Dr. Sarah Jenkins` vs `Dr. Marcus Vance`).

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local dev server
HOME=/mnt/workspace/MedVault/frontend npx ng serve
```

---

## 🛠️ Production Build Command

```bash
HOME=/mnt/workspace/MedVault/frontend npx ng build
```
Build output stored in `dist/frontend`.
