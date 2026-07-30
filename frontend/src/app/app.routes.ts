import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'patients', 
    loadComponent: () => import('./components/patients/patients.component').then(m => m.PatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_AUDITOR', 'ROLE_PATIENT'] }
  },
  { 
    path: 'encounters', 
    loadComponent: () => import('./components/encounters/encounters.component').then(m => m.EncountersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ADMIN', 'ROLE_PATIENT'] }
  },
  { 
    path: 'allergies', 
    loadComponent: () => import('./components/allergies/allergies.component').then(m => m.AllergiesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'] }
  },
  { 
    path: 'diagnoses', 
    loadComponent: () => import('./components/diagnoses/diagnoses.component').then(m => m.DiagnosesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_PATIENT'] }
  },
  { 
    path: 'records', 
    loadComponent: () => import('./components/records/records.component').then(m => m.RecordsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'] }
  },
  { 
    path: 'vitals', 
    loadComponent: () => import('./components/vitals/vitals.component').then(m => m.VitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'] }
  },
  { 
    path: 'prescriptions', 
    loadComponent: () => import('./components/prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'] }
  },
  { 
    path: 'appointments', 
    loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ADMIN', 'ROLE_PATIENT'] }
  },
  { 
    path: 'audit-ledger', 
    loadComponent: () => import('./components/audit-ledger/audit-ledger.component').then(m => m.AuditLedgerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_AUDITOR'] }
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { path: '**', redirectTo: '' }
];
