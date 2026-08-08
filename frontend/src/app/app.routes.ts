import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing.component').then((m) => m.LandingComponent),
    data: { standalone: true },
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
    data: { standalone: true },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
    data: { standalone: true },
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patient/onboarding',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },

  // --- DOCTOR WORKSPACE ROUTES ---
  {
    path: 'doctor/dashboard',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-dashboard.component').then((m) => m.DoctorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/patients',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-patients.component').then((m) => m.DoctorPatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/appointments',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-appointments.component').then((m) => m.DoctorAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/encounters',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-encounters.component').then((m) => m.DoctorEncountersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/prescriptions',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-prescriptions.component').then((m) => m.DoctorPrescriptionsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/diagnoses',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-diagnoses.component').then((m) => m.DoctorDiagnosesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/allergies',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-allergies.component').then((m) => m.DoctorAllergiesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },
  {
    path: 'doctor/vitals',
    loadComponent: () =>
      import('./workspaces/doctor/doctor-vitals.component').then((m) => m.DoctorVitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
  },

  // --- NURSE WORKSPACE ROUTES ---
  {
    path: 'nurse/dashboard',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-dashboard.component').then((m) => m.NurseDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },
  {
    path: 'nurse/patients',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-patients.component').then((m) => m.NursePatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },
  {
    path: 'nurse/appointments',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-appointments.component').then((m) => m.NurseAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },
  {
    path: 'nurse/vitals',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-vitals.component').then((m) => m.NurseVitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },
  {
    path: 'nurse/allergies',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-allergies.component').then((m) => m.NurseAllergiesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },
  {
    path: 'nurse/prescriptions',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-prescriptions.component').then((m) => m.NursePrescriptionsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_NURSE'] },
  },

  // --- ADMIN WORKSPACE ROUTES ---
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./workspaces/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./workspaces/admin/admin-users.component').then((m) => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },
  {
    path: 'admin/patients',
    loadComponent: () =>
      import('./workspaces/admin/admin-patients.component').then((m) => m.AdminPatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },
  {
    path: 'admin/appointments',
    loadComponent: () =>
      import('./workspaces/admin/admin-appointments.component').then((m) => m.AdminAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },

  // --- PATIENT WORKSPACE ROUTES ---
  {
    path: 'patient/dashboard',
    loadComponent: () =>
      import('./workspaces/patient/patient-dashboard.component').then((m) => m.PatientDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'patient/profile',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'patient/appointments',
    loadComponent: () =>
      import('./workspaces/patient/patient-appointments.component').then((m) => m.PatientAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'patient/prescriptions',
    loadComponent: () =>
      import('./workspaces/patient/patient-prescriptions.component').then((m) => m.PatientPrescriptionsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'patient/vitals',
    loadComponent: () =>
      import('./workspaces/patient/patient-vitals.component').then((m) => m.PatientVitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },
  {
    path: 'patient/allergies',
    loadComponent: () =>
      import('./workspaces/patient/patient-allergies.component').then((m) => m.PatientAllergiesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
  },

  // --- RECEPTIONIST WORKSPACE ROUTES ---
  {
    path: 'receptionist/dashboard',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-dashboard.component').then((m) => m.ReceptionistDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_RECEPTIONIST'] },
  },
  {
    path: 'receptionist/appointments',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-appointments.component').then((m) => m.ReceptionistAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_RECEPTIONIST'] },
  },
  {
    path: 'receptionist/intake',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-intake.component').then((m) => m.ReceptionistIntakeComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_RECEPTIONIST'] },
  },

  // --- LAB TECH WORKSPACE ROUTES ---
  {
    path: 'labtech/dashboard',
    loadComponent: () =>
      import('./workspaces/labtech/labtech-dashboard.component').then((m) => m.LabTechDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_LAB_TECH'] },
  },
  {
    path: 'labtech/worklist',
    loadComponent: () =>
      import('./workspaces/labtech/labtech-worklist.component').then((m) => m.LabTechWorklistComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_LAB_TECH'] },
  },
  {
    path: 'labtech/results',
    loadComponent: () =>
      import('./workspaces/labtech/labtech-results.component').then((m) => m.LabTechResultsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_LAB_TECH'] },
  },

  // --- PHARMACIST WORKSPACE ROUTES ---
  {
    path: 'pharmacist/dashboard',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-dashboard.component').then((m) => m.PharmacistDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PHARMACIST'] },
  },
  {
    path: 'pharmacist/erx',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-erx.component').then((m) => m.PharmacistErxComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PHARMACIST'] },
  },
  {
    path: 'pharmacist/dispense',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-dispense.component').then((m) => m.PharmacistDispenseComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PHARMACIST'] },
  },

  // --- BILLING WORKSPACE ROUTES ---
  {
    path: 'billing/dashboard',
    loadComponent: () =>
      import('./workspaces/billing/billing-dashboard.component').then((m) => m.BillingDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_BILLING'] },
  },
  {
    path: 'billing/invoices',
    loadComponent: () =>
      import('./workspaces/billing/billing-invoices.component').then((m) => m.BillingInvoicesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_BILLING'] },
  },
  {
    path: 'billing/claims',
    loadComponent: () =>
      import('./workspaces/billing/billing-claims.component').then((m) => m.BillingClaimsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_BILLING'] },
  },

  // --- AUDITOR WORKSPACE ROUTES ---
  {
    path: 'auditor/dashboard',
    loadComponent: () =>
      import('./workspaces/auditor/auditor-dashboard.component').then((m) => m.AuditorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_AUDITOR'] },
  },
  {
    path: 'auditor/ledger',
    loadComponent: () =>
      import('./workspaces/auditor/auditor-ledger.component').then((m) => m.AuditorLedgerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_AUDITOR', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN'] },
  },

  // Public Static Routes
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./components/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
    data: { standalone: true },
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./components/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent),
    data: { standalone: true },
  },
  { path: '**', redirectTo: 'dashboard' },
];
