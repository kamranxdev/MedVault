import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';
import { PatientContextService } from './core/services/patient-context.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="app-layout" *ngIf="authService.currentUser(); else unauth">
      <!-- Role-Tailored Sidebar Navigation -->
      <aside class="sidebar">
        <div>
          <div class="brand">
            <span class="brand-icon">🏥</span>
            <span class="brand-text">MedVault <span class="text-xs font-normal text-indigo-400 block tracking-normal">Enterprise EHR</span></span>
          </div>

          <!-- PHYSICIAN / DOCTOR SIDEBAR MENU -->
          <nav class="nav-menu" *ngIf="isDoctor()">
            <div class="nav-section-label text-emerald-400 font-extrabold">Physician Desk Workspace</div>
            
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Clinician Dashboard</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Patient Charts (MPI)</span>
            </a>
            <a routerLink="/records" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📝</span>
              <span>SOAP Progress Notes</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏥</span>
              <span>Visits & Consultations</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💊</span>
              <span>Pharmacy & eRx Orders</span>
            </a>
            <a routerLink="/diagnoses" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>Problem List (ICD-10)</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">⚠️</span>
              <span>Allergies & Risk Register</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Bedside Vitals</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>Consultation Schedule</span>
            </a>
          </nav>

          <!-- CLINICAL NURSE SIDEBAR MENU -->
          <nav class="nav-menu" *ngIf="isNurse()">
            <div class="nav-section-label text-amber-400 font-extrabold">Nurse Station Workspace</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Nursing Station</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Patient Care Charts</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Bedside Vitals Flowsheet</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">⚠️</span>
              <span>Coded Allergies & ADRs</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💊</span>
              <span>Medication Orders (MAR)</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏥</span>
              <span>Patient Intake & Visits</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>Unit Ward Schedule</span>
            </a>
          </nav>

          <!-- ADMIN / RECEPTIONIST SIDEBAR MENU -->
          <nav class="nav-menu" *ngIf="isAdmin()">
            <div class="nav-section-label text-blue-400 font-extrabold">Hospital Admin & Intake</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Command Center</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Master Patient Index (MPI)</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏥</span>
              <span>Intake Visits & Admissions</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>Appointment Scheduling</span>
            </a>
            
            <div class="nav-section-label text-slate-400 font-bold">System Administration</div>
            <a routerLink="/admin" routerLinkActive="active" class="nav-item admin-item">
              <span class="nav-icon">⚙️</span>
              <span>User RBAC Management</span>
            </a>
            <a routerLink="/audit-ledger" routerLinkActive="active" class="nav-item audit-item">
              <span class="nav-icon">🛡️</span>
              <span>HIPAA Compliance Vault</span>
            </a>
          </nav>

          <!-- COMPLIANCE AUDITOR SIDEBAR MENU -->
          <nav class="nav-menu" *ngIf="isAuditor()">
            <div class="nav-section-label text-purple-400 font-extrabold">Audit & Forensics Vault</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Compliance Overview</span>
            </a>
            <a routerLink="/audit-ledger" routerLinkActive="active" class="nav-item audit-item">
              <span class="nav-icon">🛡️</span>
              <span>HIPAA WORM Audit Vault</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Patient Access Audit Logs</span>
            </a>
          </nav>

          <!-- PATIENT SIDEBAR MENU -->
          <nav class="nav-menu" *ngIf="isPatient()">
            <div class="nav-section-label text-teal-400 font-extrabold">My Personal Health Record</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>My Health Summary</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>My Patient Chart</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💊</span>
              <span>My Prescriptions</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>My Vitals Trends</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">⚠️</span>
              <span>My Allergies</span>
            </a>
            <a routerLink="/diagnoses" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>My Problem List</span>
            </a>
            <a routerLink="/records" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📝</span>
              <span>My Progress Notes</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏥</span>
              <span>My Visit History</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>My Appointments</span>
            </a>
          </nav>
        </div>

        <!-- Sidebar User Footer -->
        <div class="sidebar-user">
          <div class="user-avatar">{{ authService.currentUser()?.fullName?.charAt(0) }}</div>
          <div class="user-meta">
            <span class="u-name">{{ authService.currentUser()?.fullName }}</span>
            <span class="u-role">{{ primaryRole() }}</span>
          </div>
          <button (click)="logout()" title="Logout" class="logout-btn">
            🚪
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Top Bar Header -->
        <header class="top-header">
          <div class="header-left flex items-center gap-3">
            <span class="font-bold text-white text-sm">MedVault</span>

            <!-- CLINICIAN PATIENT CONTEXT SELECTOR -->
            <div *ngIf="!isPatient() && patientContext.activePatient()" class="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
              <span class="text-slate-400 font-semibold">Active Chart:</span>
              <select 
                [ngModel]="patientContext.activePatient()?.id" 
                (ngModelChange)="onPatientContextChange($event)"
                class="bg-slate-900 text-indigo-300 font-bold border border-indigo-500/30 rounded-lg px-2 py-0.5 text-xs">
                <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
                  {{ p.fullName }} (MRN: {{ p.patientCode }})
                </option>
              </select>
              <span *ngIf="patientContext.activePatient()?.medicalAlerts" class="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-3xs font-extrabold uppercase">
                Alert: {{ patientContext.activePatient()?.medicalAlerts }}
              </span>
            </div>

            <!-- PATIENT SELF-SERVICE BANNER -->
            <div *ngIf="isPatient() && patientContext.activePatient()" class="flex items-center gap-2 bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-500/30 text-xs">
              <span class="text-teal-300 font-bold">Personal Health Record:</span>
              <span class="text-white font-extrabold">{{ patientContext.activePatient()?.fullName }}</span>
              <span class="font-mono text-teal-400 text-3xs bg-teal-900/60 px-1.5 py-0.5 rounded">
                MRN: {{ patientContext.activePatient()?.patientCode }}
              </span>
            </div>
          </div>

          <div class="header-right flex items-center gap-4">
            <span class="px-2.5 py-1 rounded-full text-3xs font-bold uppercase tracking-wider" [class]="getRoleBadgeClass()">
              {{ primaryRole() }}
            </span>
            <span class="live-status text-xs"><span class="pulse-dot"></span> FHIR R4 Engine</span>
          </div>
        </header>

        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>

    <ng-template #unauth>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: #090d16; color: #f8fafc; }
    .sidebar {
      width: 260px; background: #0f172a; border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; flex-direction: column; justify-content: space-between; padding: 1.25rem 0.85rem;
      position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; overflow-y: auto;
    }
    .brand { display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem; margin-bottom: 1rem; }
    .brand-icon { font-size: 1.8rem; }
    .brand-text { font-size: 1.3rem; font-weight: 800; color: #f8fafc; line-height: 1.1; }
    .nav-section-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 0.75rem 0.25rem; }
    .nav-menu { display: flex; flex-direction: column; gap: 0.2rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem 0.75rem;
      border-radius: 10px; color: #94a3b8; font-weight: 500; font-size: 0.85rem;
      transition: all 0.15s ease;
    }
    .nav-icon { font-size: 1rem; }
    .nav-item:hover, .nav-item.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .nav-item.audit-item:hover, .nav-item.audit-item.active { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .nav-item.admin-item:hover, .nav-item.admin-item.active { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .sidebar-user {
      display: flex; align-items: center; gap: 0.65rem; padding: 0.75rem;
      background: #1e293b; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); margin-top: 1rem;
    }
    .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
    .user-meta { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .u-name { font-size: 0.8rem; font-weight: 600; color: #f8fafc; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
    .u-role { font-size: 0.7rem; color: #94a3b8; }
    .logout-btn { background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 0.2rem; }
    .logout-btn:hover { color: #f43f5e; }

    .main-content { margin-left: 260px; flex-grow: 1; display: flex; flex-direction: column; min-height: 100vh; }
    .top-header {
      min-height: 56px; background: #0f172a; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.5rem; flex-wrap: wrap; gap: 0.5rem;
    }
    .live-status { color: #34d399; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
    .content-body { padding: 1.5rem; flex-grow: 1; }
  `]
})
export class App implements OnInit {
  constructor(
    public authService: AuthService, 
    public patientContext: PatientContextService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.patientContext.loadContext();
    }
  }

  onPatientContextChange(patientId: number): void {
    this.patientContext.selectPatientById(patientId);
  }

  isDoctor(): boolean { return this.authService.hasRole('ROLE_DOCTOR'); }
  isNurse(): boolean { return this.authService.hasRole('ROLE_NURSE'); }
  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
  isAuditor(): boolean { return this.authService.hasRole('ROLE_AUDITOR'); }
  isPatient(): boolean { return this.authService.hasRole('ROLE_PATIENT'); }

  primaryRole(): string {
    const roles = this.authService.currentUser()?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'Admin / Reception';
    if (roles.includes('ROLE_DOCTOR')) return 'Physician / Clinician';
    if (roles.includes('ROLE_NURSE')) return 'Clinical Nurse';
    if (roles.includes('ROLE_AUDITOR')) return 'Compliance Auditor';
    return 'Patient Portal';
  }

  getRoleBadgeClass(): string {
    const role = this.primaryRole();
    if (role.includes('Admin')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (role.includes('Physician')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (role.includes('Nurse')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    if (role.includes('Auditor')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  }

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
