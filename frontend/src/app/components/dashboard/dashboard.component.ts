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
        <div class="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-teal-500/20 shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
                <i class="ri-user-heart-line"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold tracking-tight text-white">Welcome, {{ patient()?.fullName || currentUser?.fullName }}</h1>
                <div class="flex items-center gap-3 mt-1.5 text-sm">
                  <span class="text-teal-200/80 font-medium flex items-center gap-1"><i class="ri-hospital-line"></i> Personal Health Portal</span>
                  <span class="text-teal-500/50">&bull;</span>
                  <span class="text-slate-300">MRN: <span class="font-mono text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">{{ patient()?.patientCode }}</span></span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-end gap-2 text-right">
              <div class="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-sm">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Insurance Coverage</p>
                <p class="font-bold text-white flex items-center gap-2">
                  <i class="ri-shield-check-line text-teal-400"></i> {{ patient()?.insuranceProvider || 'Self-Pay' }}
                </p>
                <p class="text-xs text-slate-500 font-mono mt-0.5">Policy: {{ patient()?.insurancePolicyNumber || 'N/A' }}</p>
              </div>
              <a routerLink="/appointments" class="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2 transform hover:-translate-y-0.5">
                <i class="ri-calendar-event-line"></i> Request Consultation
              </a>
            </div>
          </div>
        </div>

        <!-- Patient Health Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Active Medical Alerts -->
          <div class="bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-rose-500/30 transition group">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <div class="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:scale-110 transition-transform"><i class="ri-alert-line"></i></div>
                Medical Alerts
              </h3>
              <a routerLink="/allergies" class="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition">Details <i class="ri-arrow-right-line"></i></a>
            </div>
            <div class="p-4 bg-rose-950/30 border border-rose-900/50 rounded-2xl">
              <p class="font-medium text-sm text-rose-200 flex items-start gap-2">
                <i class="ri-information-line mt-0.5"></i>
                <span>{{ patient()?.medicalAlerts || 'No documented critical alerts or allergies.' }}</span>
              </p>
            </div>
          </div>

          <!-- Active Prescriptions Count -->
          <div class="bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-teal-500/30 transition group">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <div class="p-2 bg-teal-500/10 rounded-lg text-teal-400 group-hover:scale-110 transition-transform"><i class="ri-capsule-line"></i></div>
                Active Medications
              </h3>
              <a routerLink="/prescriptions" class="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition">View All <i class="ri-arrow-right-line"></i></a>
            </div>
            <div class="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex justify-between items-center">
              <div>
                <span class="text-3xl font-black text-white block">{{ activeRxCount() }}</span>
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Prescriptions</span>
              </div>
              <div class="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-2xl text-teal-400/80">
                <i class="ri-medicine-bottle-line"></i>
              </div>
            </div>
          </div>

          <!-- Recent Vitals -->
          <div class="bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-teal-500/30 transition group">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform"><i class="ri-pulse-line"></i></div>
                Latest Vitals
              </h3>
              <a routerLink="/vitals" class="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition">Flowsheet <i class="ri-arrow-right-line"></i></a>
            </div>
            <div *ngIf="latestVitals()" class="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-3">
              <div class="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span class="text-xs font-semibold text-slate-400 flex items-center gap-1"><i class="ri-heart-pulse-line"></i> Blood Pressure</span>
                <span class="text-emerald-400 font-bold font-mono">{{ latestVitals()?.bloodPressure }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-400 flex items-center gap-1"><i class="ri-heart-line"></i> Heart Rate</span>
                <span class="text-emerald-400 font-bold font-mono">{{ latestVitals()?.heartRate }} <span class="text-xs text-slate-500">bpm</span></span>
              </div>
            </div>
            <div *ngIf="!latestVitals()" class="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 text-sm text-slate-400 text-center flex flex-col items-center gap-2">
              <i class="ri-history-line text-2xl text-slate-600"></i>
              No recent vitals logged.
            </div>
          </div>
        </div>

        <!-- Quick Patient Portal Navigation Hub -->
        <div class="space-y-4 pt-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="ri-apps-2-line text-teal-400"></i> Portal Services
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a routerLink="/patients" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group">
              <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all"><i class="ri-folder-user-line"></i></div>
              <h3 class="font-bold text-white text-base">My Chart</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Demographics, policy & emergency contacts.</p>
            </a>

            <a routerLink="/prescriptions" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all"><i class="ri-capsule-line"></i></div>
              <h3 class="font-bold text-white text-base">Prescriptions</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Dosage, refills & medication instructions.</p>
            </a>

            <a routerLink="/appointments" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all"><i class="ri-calendar-check-line"></i></div>
              <h3 class="font-bold text-white text-base">Appointments</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Upcoming visits & consultation booking.</p>
            </a>

            <a routerLink="/vitals" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all"><i class="ri-line-chart-line"></i></div>
              <h3 class="font-bold text-white text-base">Vitals History</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Health trends, BP & temperature graphs.</p>
            </a>
          </div>
        </div>
      </div>

      <!-- CLINICIAN / DOCTOR / NURSE / ADMIN DASHBOARD -->
      <div *ngIf="!authService.hasRole('ROLE_PATIENT')" class="space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
                <i class="ri-hospital-building-line"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold tracking-tight text-white">Welcome, {{ currentUser?.fullName }}</h1>
                <div class="flex items-center gap-3 mt-1.5">
                  <span class="text-slate-400 text-sm font-medium"><i class="ri-shield-user-line"></i> Active Shift</span>
                  <span class="text-slate-600">&bull;</span>
                  <span [class]="getRoleBadgeClass()" class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                    <i class="ri-verified-badge-line"></i> {{ primaryRole() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="bg-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/50 flex flex-col items-center min-w-[120px] shadow-sm">
                <span class="text-3xl font-black text-white leading-none">{{ patientCount() }}</span>
                <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">MPI Census</span>
              </div>

              <button 
                *ngIf="authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR'])"
                (click)="generateSyntheticCohort()"
                [disabled]="generating()"
                class="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 transform hover:-translate-y-0.5">
                <i [class]="generating() ? 'ri-loader-4-line animate-spin' : 'ri-magic-line'"></i> 
                {{ generating() ? 'Generating...' : 'Synthetic Cohort' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Role-Tailored Command Hub -->
        <div class="space-y-4 pt-2">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="ri-dashboard-2-line text-indigo-400"></i> Command Hub
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Action 1: Patient Charts -->
            <a routerLink="/patients" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all"><i class="ri-folder-shared-line"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-indigo-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Patient Charts</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">MPI, EHR summaries & clinical context.</p>
            </a>

            <!-- Action 2: Visits & Encounters -->
            <a routerLink="/encounters" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all"><i class="ri-stethoscope-line"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-blue-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Visits & Encounters</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Consultation logs & SOAP notes.</p>
            </a>

            <!-- Action 3: Pharmacy & eRx -->
            <a *ngIf="authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ADMIN'])" routerLink="/prescriptions" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all"><i class="ri-capsule-fill"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-emerald-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Pharmacy & eRx</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Medication orders & contraindications.</p>
            </a>

            <!-- Action 4: Bedside Vitals -->
            <a *ngIf="authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ADMIN'])" routerLink="/vitals" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-amber-500/20 transition-all"><i class="ri-heart-pulse-fill"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-amber-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Bedside Vitals</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Flowsheets for BP, HR, Temp & BMI.</p>
            </a>

            <!-- Action 5: Coded Diagnoses -->
            <a routerLink="/diagnoses" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all"><i class="ri-clipboard-pulse-line"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-purple-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Problem List</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">ICD-10 & SNOMED coded conditions.</p>
            </a>

            <!-- Action 6: Allergies & Safety -->
            <a routerLink="/allergies" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-rose-500/20 transition-all"><i class="ri-alert-fill"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-rose-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Allergies & Risk</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Adverse reactions & safety tracking.</p>
            </a>

            <!-- Action 7: HIPAA Audit Vault (Auditor / Admin) -->
            <a *ngIf="authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_AUDITOR'])" routerLink="/audit-ledger" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all"><i class="ri-shield-keyhole-line"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-cyan-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Audit Vault</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">HIPAA compliance ledger & reports.</p>
            </a>

            <!-- Action 8: Appointments -->
            <a routerLink="/appointments" class="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-sm group flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-teal-500/20 transition-all"><i class="ri-calendar-event-line"></i></div>
                <i class="ri-arrow-right-up-line text-slate-500 group-hover:text-teal-400 transition-colors"></i>
              </div>
              <h3 class="font-bold text-white text-base">Appointments</h3>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">Provider scheduling & consultation slots.</p>
            </a>
          </div>
        </div>

        <!-- Master Patient Census Summary -->
        <div class="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-white text-lg flex items-center gap-2">
              <i class="ri-group-line text-indigo-400"></i> Active Patient Census
            </h3>
            <a routerLink="/patients" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">View All <i class="ri-arrow-right-line"></i></a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5" *ngIf="recentPatients().length > 0">
            <div *ngFor="let p of recentPatients().slice(0, 3)" class="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-indigo-500/30 transition shadow-sm group flex flex-col h-full">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                    {{ p.fullName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{{ p.fullName }}</p>
                    <span class="text-xs font-mono text-indigo-400/80">{{ p.patientCode }}</span>
                  </div>
                </div>
                <span class="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-md flex items-center gap-1">
                  <i class="ri-drop-fill"></i> {{ p.bloodType }}
                </span>
              </div>

              <div class="mt-auto space-y-3">
                <p class="text-xs text-slate-400 flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg">
                  <i class="ri-shield-check-line text-slate-500"></i>
                  <span class="truncate">{{ p.insuranceProvider || 'Self-Pay' }}</span>
                </p>
                <button (click)="selectPatientContext(p)" class="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg transition border border-indigo-500/20 flex items-center justify-center gap-2">
                  <i class="ri-file-chart-line"></i> Open EHR Chart
                </button>
              </div>
            </div>
          </div>
          
          <div *ngIf="recentPatients().length === 0" class="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
             <i class="ri-folder-info-line text-4xl text-slate-600"></i>
             <p>No patients in the active census.</p>
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
