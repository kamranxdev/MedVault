import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientsComponent } from './components/patients/patients.component';
import { EncountersComponent } from './components/encounters/encounters.component';
import { AllergiesComponent } from './components/allergies/allergies.component';
import { DiagnosesComponent } from './components/diagnoses/diagnoses.component';
import { RecordsComponent } from './components/records/records.component';
import { VitalsComponent } from './components/vitals/vitals.component';
import { PrescriptionsComponent } from './components/prescriptions/prescriptions.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuditLedgerComponent } from './components/audit-ledger/audit-ledger.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'patients', component: PatientsComponent, canActivate: [authGuard] },
  { path: 'encounters', component: EncountersComponent, canActivate: [authGuard] },
  { path: 'allergies', component: AllergiesComponent, canActivate: [authGuard] },
  { path: 'diagnoses', component: DiagnosesComponent, canActivate: [authGuard] },
  { path: 'records', component: RecordsComponent, canActivate: [authGuard] },
  { path: 'vitals', component: VitalsComponent, canActivate: [authGuard] },
  { path: 'prescriptions', component: PrescriptionsComponent, canActivate: [authGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [authGuard] },
  { 
    path: 'audit-ledger', 
    component: AuditLedgerComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['ROLE_ADMIN', 'ROLE_AUDITOR'] } 
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['ROLE_ADMIN'] } 
  },
  { path: '**', redirectTo: '' }
];
