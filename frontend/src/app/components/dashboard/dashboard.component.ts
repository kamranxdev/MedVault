import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, Patient, Prescription, Vitals } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- PATIENT PERSONA DASHBOARD -->
      <div *ngIf="authService.hasRole('ROLE_PATIENT')" class="space-y-6">
        <!-- Patient Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 rounded-3xl border border-teal-800/40 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div class="space-y-2 z-10">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center text-2xl font-bold">
                👤
              </div>
              <div>
                <h1 class="text-3xl font-extrabold tracking-tight">Welcome, {{ patient()?.fullName || currentUser?.fullName }}</h1>
                <p class="text-teal-300/80 text-xs mt-0.5 font-medium">Personal Health Record Portal &bull; MRN: <span class="font-mono font-bold">{{ patient()?.patientCode }}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-2 pt-1 text-xs text-slate-300">
              <span>Insurer: <strong class="text-white">{{ patient()?.insuranceProvider || 'Self-Pay' }}</strong> (Policy: {{ patient()?.insurancePolicyNumber || 'N/A' }})</span>
            </div>
          </div>

          <div class="flex items-center gap-3 z-10">
            <a routerLink="/appointments" class="px-5 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2">
              <span>📅</span> Request Consultation
            </a>
          </div>
        </div>

        <!-- Patient Health Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Active Medical Alerts -->
          <div class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-white text-sm flex items-center gap-2">
                <span>⚠️</span> Medical Alerts & Allergies
              </h3>
              <a routerLink="/allergies" class="text-xs font-semibold text-teal-400 hover:underline">Details ➔</a>
            </div>
            <div class="p-4 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-200">
              <p class="font-semibold">{{ patient()?.medicalAlerts || 'No documented critical alerts' }}</p>
            </div>
          </div>

          <!-- Active Prescriptions Count -->
          <div class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-white text-sm flex items-center gap-2">
                <span>💊</span> My Active Medications
              </h3>
              <a routerLink="/prescriptions" class="text-xs font-semibold text-teal-400 hover:underline">View All ➔</a>
            </div>
            <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <span class="text-2xl font-black text-white block">{{ activeRxCount() }}</span>
                <span class="text-xs text-slate-400">Prescriptions on file</span>
              </div>
              <span class="text-2xl">📦</span>
            </div>
          </div>

          <!-- Recent Vitals -->
          <div class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-white text-sm flex items-center gap-2">
                <span>📈</span> Latest Vital Signs
              </h3>
              <a routerLink="/vitals" class="text-xs font-semibold text-teal-400 hover:underline">Flowsheet ➔</a>
            </div>
            <div *ngIf="latestVitals()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p class="text-white"><strong class="text-slate-400">Blood Pressure:</strong> <span class="text-emerald-400 font-bold font-mono">{{ latestVitals()?.bloodPressure }}</span></p>
              <p class="text-white"><strong class="text-slate-400">Heart Rate:</strong> <span class="text-emerald-400 font-bold font-mono">{{ latestVitals()?.heartRate }} bpm</span></p>
            </div>
            <div *ngIf="!latestVitals()" class="p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-400">
              No recent vitals logged.
            </div>
          </div>
        </div>

        <!-- Quick Patient Portal Navigation Hub -->
        <div class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>⚡</span> My Health Portal Services
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a routerLink="/patients" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-teal-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">👤</div>
              <h3 class="font-bold text-white text-sm">My Patient Chart</h3>
              <p class="text-xs text-slate-400 mt-1">Personal demographics, policy number & emergency contacts.</p>
            </a>

            <a routerLink="/prescriptions" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">💊</div>
              <h3 class="font-bold text-white text-sm">My Prescriptions</h3>
              <p class="text-xs text-slate-400 mt-1">Dosage, frequency, refill counts & doctor instructions.</p>
            </a>

            <a routerLink="/appointments" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">📅</div>
              <h3 class="font-bold text-white text-sm">My Appointments</h3>
              <p class="text-xs text-slate-400 mt-1">Upcoming consultations & book new doctor appointment.</p>
            </a>

            <a routerLink="/vitals" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-amber-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">📈</div>
              <h3 class="font-bold text-white text-sm">My Vitals History</h3>
              <p class="text-xs text-slate-400 mt-1">Longitudinal BP, Heart Rate, Glucose & Temperature graphs.</p>
            </a>
          </div>
        </div>
      </div>

      <!-- CLINICIAN / DOCTOR / NURSE / ADMIN DASHBOARD -->
      <div *ngIf="!authService.hasRole('ROLE_PATIENT')" class="space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div class="space-y-2 z-10">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🏥</span>
              <div>
                <h1 class="text-3xl font-extrabold tracking-tight">Welcome, {{ currentUser?.fullName }}</h1>
                <p class="text-slate-300 text-xs mt-0.5">MedVault Enterprise Health Record &bull; Active Shift</p>
              </div>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <span class="text-xs text-slate-400">Authenticated Role Assertion:</span>
              <span [class]="getRoleBadgeClass()" class="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {{ primaryRole() }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 z-10">
            <div class="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <span class="text-2xl font-black block">{{ patientCount() }}</span>
              <span class="text-xs text-slate-300 uppercase tracking-wider">MPI Patients</span>
            </div>

            <button 
              *ngIf="authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR'])"
              (click)="generateSyntheticCohort()"
              [disabled]="generating()"
              class="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2">
              <span>✨</span> {{ generating() ? 'Generating Cohort...' : 'Generate Synthetic Cohort' }}
            </button>
          </div>
        </div>

        <!-- Role-Tailored Command Hub -->
        <div class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>⚡</span> Role-Tailored Clinical Command Hub
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Action 1: Patient Charts -->
            <a routerLink="/patients" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">👤</div>
              <h3 class="font-bold text-white text-sm">Patient Clinical Charts</h3>
              <p class="text-xs text-slate-400 mt-1">Master Patient Index, EHR chart summary, SOAP notes.</p>
            </a>

            <!-- Action 2: Visits & Encounters -->
            <a routerLink="/encounters" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">🏥</div>
              <h3 class="font-bold text-white text-sm">Visits & Encounters</h3>
              <p class="text-xs text-slate-400 mt-1">Inpatient, Outpatient, ER & Telehealth consultation logs.</p>
            </a>

            <!-- Action 3: Pharmacy & eRx -->
            <a *ngIf="authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ADMIN'])" routerLink="/prescriptions" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">💊</div>
              <h3 class="font-bold text-white text-sm">Pharmacy & e-Prescriptions</h3>
              <p class="text-xs text-slate-400 mt-1">Order entry with Smart Safety allergy contraindication alerts.</p>
            </a>

            <!-- Action 4: Bedside Vitals -->
            <a *ngIf="authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ADMIN'])" routerLink="/vitals" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-amber-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">📈</div>
              <h3 class="font-bold text-white text-sm">Bedside Vital Signs</h3>
              <p class="text-xs text-slate-400 mt-1">Time-series BP, HR, Temp, Glucose & BMI flowsheet.</p>
            </a>

            <!-- Action 5: Coded Diagnoses -->
            <a routerLink="/diagnoses" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-purple-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">📋</div>
              <h3 class="font-bold text-white text-sm">Problem List (ICD-10)</h3>
              <p class="text-xs text-slate-400 mt-1">ICD-10 & SNOMED CT coded condition management.</p>
            </a>

            <!-- Action 6: Allergies & Safety -->
            <a routerLink="/allergies" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-rose-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">⚠️</div>
              <h3 class="font-bold text-white text-sm">Allergies & Risk</h3>
              <p class="text-xs text-slate-400 mt-1">Coded drug allergy registry & adverse reaction tracking.</p>
            </a>

            <!-- Action 7: HIPAA Audit Vault (Auditor / Admin) -->
            <a *ngIf="authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_AUDITOR'])" routerLink="/audit-ledger" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">🛡️</div>
              <h3 class="font-bold text-white text-sm">Compliance Audit Vault</h3>
              <p class="text-xs text-slate-400 mt-1">Immutable WORM ledger & HIPAA forensic report exporter.</p>
            </a>

            <!-- Action 8: Appointments -->
            <a routerLink="/appointments" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-teal-500 transition shadow-sm group">
              <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">📅</div>
              <h3 class="font-bold text-white text-sm">Appointments & Calendar</h3>
              <p class="text-xs text-slate-400 mt-1">Provider scheduling & patient consultation slots.</p>
            </a>
          </div>
        </div>

        <!-- Master Patient Census Summary -->
        <div class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-white text-base">Active Patient Census (Master Patient Index)</h3>
            <a routerLink="/patients" class="text-xs font-semibold text-indigo-400 hover:underline">View All Patients ➔</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4" *ngIf="recentPatients().length > 0">
            <div *ngFor="let p of recentPatients().slice(0, 3)" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-white text-sm">{{ p.fullName }}</p>
                  <span class="text-xs font-mono text-indigo-400 font-semibold">{{ p.patientCode }}</span>
                </div>
                <span class="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-xs font-bold rounded">{{ p.bloodType }}</span>
              </div>

              <p class="text-xs text-slate-400">Insurer: {{ p.insuranceProvider || 'Self-Pay' }}</p>
              <button (click)="selectPatientContext(p)" class="text-xs font-semibold text-indigo-400 hover:underline block pt-1">Open EHR Chart Context ➔</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  patientCount = signal(0);
  recentPatients = signal<Patient[]>([]);
  generating = signal(false);

  patient = signal<Patient | null>(null);
  activeRxCount = signal(0);
  latestVitals = signal<Vitals | null>(null);

  constructor(
    public authService: AuthService, 
    private apiService: ApiService,
    public patientContext: PatientContextService
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_PATIENT')) {
      const u = this.currentUser;
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          this.patient.set(p);
          if (p) {
            this.apiService.getPrescriptionsByPatient(p.id).subscribe(rx => this.activeRxCount.set(rx.length));
            this.apiService.getVitalsByPatient(p.id).subscribe(v => {
              if (v.length > 0) this.latestVitals.set(v[v.length - 1]);
            });
          }
        });
      }
    } else {
      this.loadClinicianData();
    }
  }

  loadClinicianData(): void {
    this.apiService.getPatients().subscribe({
      next: (pts) => {
        this.patientCount.set(pts.length);
        this.recentPatients.set(pts);
      }
    });
  }

  selectPatientContext(p: Patient): void {
    this.patientContext.setActivePatient(p);
  }

  generateSyntheticCohort(): void {
    this.generating.set(true);
    this.apiService.generateSyntheticCohort(3).subscribe({
      next: () => {
        this.generating.set(false);
        this.loadClinicianData();
        this.patientContext.loadContext();
      },
      error: () => this.generating.set(false)
    });
  }

  primaryRole(): string {
    const roles = this.currentUser?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'ADMINISTRATOR / RECEPTION';
    if (roles.includes('ROLE_DOCTOR')) return 'PHYSICIAN / CLINICIAN';
    if (roles.includes('ROLE_NURSE')) return 'CLINICAL NURSE';
    if (roles.includes('ROLE_AUDITOR')) return 'COMPLIANCE AUDITOR';
    return 'PATIENT PORTAL';
  }

  getRoleBadgeClass(): string {
    const role = this.primaryRole();
    if (role.includes('ADMIN')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (role.includes('PHYSICIAN')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (role.includes('NURSE')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    if (role.includes('AUDITOR')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  }
}
