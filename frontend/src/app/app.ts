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
      <aside class="sidebar glass-strong">
        <div>
          <div class="brand">
            <i class="ri-heart-pulse-fill brand-icon"></i>
            <span class="brand-text">MedVault <span class="text-xs font-normal text-indigo-400 block tracking-normal">Enterprise EHR</span></span>
          </div>

          <!-- PHYSICIAN / DOCTOR SIDEBAR MENU -->
          <nav class="nav-menu stagger-1" *ngIf="isDoctor()">
            <div class="nav-section-label text-emerald-400 font-extrabold">Physician Desk Workspace</div>
            
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <i class="ri-dashboard-3-line nav-icon"></i>
              <span>Clinician Dashboard</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <i class="ri-user-heart-line nav-icon"></i>
              <span>Patient Charts (MPI)</span>
            </a>
            <a routerLink="/records" routerLinkActive="active" class="nav-item">
              <i class="ri-file-text-line nav-icon"></i>
              <span>SOAP Progress Notes</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <i class="ri-hospital-line nav-icon"></i>
              <span>Visits & Consultations</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <i class="ri-capsule-line nav-icon"></i>
              <span>Pharmacy & eRx Orders</span>
            </a>
            <a routerLink="/diagnoses" routerLinkActive="active" class="nav-item">
              <i class="ri-list-check-2 nav-icon"></i>
              <span>Problem List (ICD-10)</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <i class="ri-alarm-warning-line nav-icon"></i>
              <span>Allergies & Risk Register</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <i class="ri-pulse-line nav-icon"></i>
              <span>Bedside Vitals</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <i class="ri-calendar-schedule-line nav-icon"></i>
              <span>Consultation Schedule</span>
            </a>
          </nav>

          <!-- CLINICAL NURSE SIDEBAR MENU -->
          <nav class="nav-menu stagger-2" *ngIf="isNurse()">
            <div class="nav-section-label text-amber-400 font-extrabold">Nurse Station Workspace</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <i class="ri-dashboard-3-line nav-icon"></i>
              <span>Nursing Station</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <i class="ri-user-heart-line nav-icon"></i>
              <span>Patient Care Charts</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <i class="ri-pulse-line nav-icon"></i>
              <span>Bedside Vitals Flowsheet</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <i class="ri-alarm-warning-line nav-icon"></i>
              <span>Coded Allergies & ADRs</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <i class="ri-capsule-line nav-icon"></i>
              <span>Medication Orders (MAR)</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <i class="ri-hospital-line nav-icon"></i>
              <span>Patient Intake & Visits</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <i class="ri-calendar-schedule-line nav-icon"></i>
              <span>Unit Ward Schedule</span>
            </a>
          </nav>

          <!-- ADMIN / RECEPTIONIST SIDEBAR MENU -->
          <nav class="nav-menu stagger-3" *ngIf="isAdmin()">
            <div class="nav-section-label text-blue-400 font-extrabold">Hospital Admin & Intake</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <i class="ri-dashboard-3-line nav-icon"></i>
              <span>Command Center</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <i class="ri-user-heart-line nav-icon"></i>
              <span>Master Patient Index (MPI)</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <i class="ri-hospital-line nav-icon"></i>
              <span>Intake Visits & Admissions</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <i class="ri-calendar-schedule-line nav-icon"></i>
              <span>Appointment Scheduling</span>
            </a>
            
            <div class="nav-section-label text-slate-400 font-bold">System Administration</div>
            <a routerLink="/admin" routerLinkActive="active" class="nav-item admin-item">
              <i class="ri-settings-3-line nav-icon"></i>
              <span>User RBAC Management</span>
            </a>
            <a routerLink="/audit-ledger" routerLinkActive="active" class="nav-item audit-item">
              <i class="ri-shield-check-line nav-icon"></i>
              <span>HIPAA Compliance Vault</span>
            </a>
          </nav>

          <!-- COMPLIANCE AUDITOR SIDEBAR MENU -->
          <nav class="nav-menu stagger-4" *ngIf="isAuditor()">
            <div class="nav-section-label text-purple-400 font-extrabold">Audit & Forensics Vault</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <i class="ri-dashboard-3-line nav-icon"></i>
              <span>Compliance Overview</span>
            </a>
            <a routerLink="/audit-ledger" routerLinkActive="active" class="nav-item audit-item">
              <i class="ri-shield-check-line nav-icon"></i>
              <span>HIPAA WORM Audit Vault</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <i class="ri-user-heart-line nav-icon"></i>
              <span>Patient Access Audit Logs</span>
            </a>
          </nav>

          <!-- PATIENT SIDEBAR MENU -->
          <nav class="nav-menu stagger-5" *ngIf="isPatient()">
            <div class="nav-section-label text-teal-400 font-extrabold">My Personal Health Record</div>

            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <i class="ri-dashboard-3-line nav-icon"></i>
              <span>My Health Summary</span>
            </a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <i class="ri-user-heart-line nav-icon"></i>
              <span>My Patient Chart</span>
            </a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-item">
              <i class="ri-capsule-line nav-icon"></i>
              <span>My Prescriptions</span>
            </a>
            <a routerLink="/vitals" routerLinkActive="active" class="nav-item">
              <i class="ri-pulse-line nav-icon"></i>
              <span>My Vitals Trends</span>
            </a>
            <a routerLink="/allergies" routerLinkActive="active" class="nav-item">
              <i class="ri-alarm-warning-line nav-icon"></i>
              <span>My Allergies</span>
            </a>
            <a routerLink="/diagnoses" routerLinkActive="active" class="nav-item">
              <i class="ri-list-check-2 nav-icon"></i>
              <span>My Problem List</span>
            </a>
            <a routerLink="/records" routerLinkActive="active" class="nav-item">
              <i class="ri-file-text-line nav-icon"></i>
              <span>My Progress Notes</span>
            </a>
            <a routerLink="/encounters" routerLinkActive="active" class="nav-item">
              <i class="ri-hospital-line nav-icon"></i>
              <span>My Visit History</span>
            </a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <i class="ri-calendar-schedule-line nav-icon"></i>
              <span>My Appointments</span>
            </a>
          </nav>
        </div>

        <!-- Sidebar User Footer -->
        <div class="sidebar-user glass">
          <div class="user-avatar">{{ authService.currentUser()?.fullName?.charAt(0) }}</div>
          <div class="user-meta">
            <span class="u-name">{{ authService.currentUser()?.fullName }}</span>
            <span class="u-role">{{ primaryRole() }}</span>
          </div>
          <button (click)="logout()" title="Logout" class="logout-btn">
            <i class="ri-logout-box-r-line"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Top Bar Header -->
        <header class="top-header glass-subtle animate-slide-up">
          <div class="header-left flex items-center gap-3">
            <span class="font-bold text-white text-sm tracking-wide">MedVault</span>

            <!-- CLINICIAN PATIENT CONTEXT SELECTOR -->
            <div *ngIf="!isPatient() && patientContext.activePatient()" class="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-inner">
              <span class="text-slate-400 font-semibold">Active Chart:</span>
              <select 
                [ngModel]="patientContext.activePatient()?.id" 
                (ngModelChange)="onPatientContextChange($event)"
                class="bg-slate-900/50 text-indigo-300 font-bold border border-indigo-500/30 rounded-lg px-2 py-0.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200">
                <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
                  {{ p.fullName }} (MRN: {{ p.patientCode }})
                </option>
              </select>
              <span *ngIf="patientContext.activePatient()?.medicalAlerts" class="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-extrabold uppercase animate-pulse">
                Alert: {{ patientContext.activePatient()?.medicalAlerts }}
              </span>
            </div>

            <!-- PATIENT SELF-SERVICE BANNER -->
            <div *ngIf="isPatient() && patientContext.activePatient()" class="flex items-center gap-2 bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-500/30 text-xs shadow-inner">
              <span class="text-teal-300 font-bold">Personal Health Record:</span>
              <span class="text-white font-extrabold">{{ patientContext.activePatient()?.fullName }}</span>
              <span class="font-mono text-teal-400 text-xs bg-teal-900/60 px-1.5 py-0.5 rounded">
                MRN: {{ patientContext.activePatient()?.patientCode }}
              </span>
            </div>
          </div>

          <div class="header-right flex items-center gap-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm" [class]="getRoleBadgeClass()">
              {{ primaryRole() }}
            </span>
            <span class="live-status text-xs"><span class="pulse-dot"></span> FHIR R4 Engine</span>
          </div>
        </header>

        <div class="content-body animate-fade-in">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>

    <ng-template #unauth>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: var(--bg-main); color: var(--text-primary); overflow: hidden; }
    .sidebar {
      width: 280px; background: var(--bg-card); border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem 1rem;
      position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; overflow-y: auto;
    }
    .brand { display: flex; align-items: center; gap: 0.8rem; padding: 0.5rem; margin-bottom: 1.5rem; }
    .brand-icon { font-size: 2.2rem; color: #6366f1; filter: drop-shadow(0 0 8px rgba(99,102,241,0.4)); }
    .brand-text { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
    .nav-section-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 1rem 0.75rem 0.5rem; }
    .nav-menu { display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      border-radius: 12px; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-icon { font-size: 1.2rem; transition: transform 0.2s ease; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.03); color: var(--text-primary); transform: translateX(2px); }
    .nav-item:hover .nav-icon { transform: scale(1.1); }
    .nav-item.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; box-shadow: inset 2px 0 0 #6366f1; }
    .nav-item.audit-item.active { background: rgba(168, 85, 247, 0.15); color: #c084fc; box-shadow: inset 2px 0 0 #a855f7; }
    .nav-item.admin-item.active { background: rgba(59, 130, 246, 0.15); color: #60a5fa; box-shadow: inset 2px 0 0 #3b82f6; }
    .sidebar-user {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem;
      border-radius: 16px; margin-top: 1.5rem;
    }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .user-meta { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .u-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
    .u-role { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
    .logout-btn { background: none; border: none; color: var(--text-muted); font-size: 1.3rem; cursor: pointer; padding: 0.4rem; border-radius: 8px; transition: all 0.2s ease; }
    .logout-btn:hover { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }

    .main-content { margin-left: 280px; flex-grow: 1; display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-main); overflow-y: auto; }
    .top-header {
      min-height: 64px; border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 2rem; flex-wrap: wrap; gap: 1rem;
      position: sticky; top: 0; z-index: 50;
    }
    .live-status { color: #10b981; display: flex; align-items: center; gap: 0.6rem; font-weight: 600; letter-spacing: 0.02em; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulseGlow 2s infinite; }
    .content-body { padding: 2rem; flex-grow: 1; max-width: 1400px; width: 100%; margin: 0 auto; }
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

  onPatientContextChange(patientId: string | number): void {
    this.patientContext.selectPatientById(Number(patientId));
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
