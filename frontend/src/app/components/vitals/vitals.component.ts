import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Vitals } from '../../core/models/models';

@Component({
  selector: 'app-vitals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-pulse-line text-2xl text-amber-400"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Bedside Vitals History' : 'Longitudinal Bedside Vital Signs Flowsheet' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Time-series physiological metrics, Blood Pressure, Heart Rate, Temperature, Glucose, SpO2, and calculated BMI.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500">
            <option [value]="0">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="canRecordVitals()" 
            (click)="showModal.set(true)" 
            [disabled]="selectedPatientId === 0"
            class="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <span>+</span> Record Bedside Vitals
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="selectedPatientId === 0" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view longitudinal physiological trends.</p>
      </div>

      <div *ngIf="selectedPatientId > 0" class="space-y-6">
        <!-- Time Series Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" *ngIf="latestVitals()">
          <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
            <span class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Latest Blood Pressure</span>
            <div class="text-2xl font-black text-rose-400">{{ latestVitals()?.bloodPressure }} <span class="text-xs font-normal text-slate-400">mmHg</span></div>
          </div>
          <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
            <span class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Heart Rate</span>
            <div class="text-2xl font-black text-emerald-400">{{ latestVitals()?.heartRate }} <span class="text-xs font-normal text-slate-400">bpm</span></div>
          </div>
          <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
            <span class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Blood Glucose</span>
            <div class="text-2xl font-black text-amber-400">{{ latestVitals()?.bloodGlucose || 'N/A' }} <span class="text-xs font-normal text-slate-400">mg/dL</span></div>
          </div>
          <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
            <span class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">SpO2 Oxygen</span>
            <div class="text-2xl font-black text-indigo-400">{{ latestVitals()?.oxygenSaturation }}%</div>
          </div>
        </div>

        <!-- Vitals Table / History -->
        <div class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 class="font-bold text-white text-base">Longitudinal Bedside Readings</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-3xs">
                <tr>
                  <th class="p-3 rounded-l-xl">Recorded At</th>
                  <th class="p-3">BP (mmHg)</th>
                  <th class="p-3">HR (bpm)</th>
                  <th class="p-3">Temp (°C)</th>
                  <th class="p-3">SpO2 (%)</th>
                  <th class="p-3">Glucose</th>
                  <th class="p-3 rounded-r-xl">Logged By</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr *ngFor="let v of vitalsList()" class="hover:bg-slate-800/40 transition">
                  <td class="p-3 font-mono text-slate-400">{{ v.recordedAt | date:'medium' }}</td>
                  <td class="p-3 font-bold text-rose-400">{{ v.bloodPressure }}</td>
                  <td class="p-3 font-bold text-emerald-400">{{ v.heartRate }}</td>
                  <td class="p-3">{{ v.temperature }}</td>
                  <td class="p-3 font-bold text-indigo-400">{{ v.oxygenSaturation }}%</td>
                  <td class="p-3 font-bold text-amber-400">{{ v.bloodGlucose || '-' }}</td>
                  <td class="p-3 text-slate-400">{{ v.recordedBy?.fullName || 'Clinical Staff' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Record Vitals Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-amber-400">Record Bedside Vital Signs</h3>
            <button (click)="showModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <form (ngSubmit)="saveVitals()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Blood Pressure (mmHg) *</label>
                <input type="text" [(ngModel)]="newVitals.bloodPressure" name="bloodPressure" placeholder="120/80" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Heart Rate (bpm) *</label>
                <input type="number" [(ngModel)]="newVitals.heartRate" name="heartRate" placeholder="72" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Temp (°C)</label>
                <input type="number" step="0.1" [(ngModel)]="newVitals.temperature" name="temperature" placeholder="36.8" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">SpO2 (%)</label>
                <input type="number" [(ngModel)]="newVitals.oxygenSaturation" name="oxygenSaturation" placeholder="98" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Glucose (mg/dL)</label>
                <input type="number" [(ngModel)]="newVitals.bloodGlucose" name="bloodGlucose" placeholder="115" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl">Save Vitals Reading</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class VitalsComponent implements OnInit {
  vitalsList = signal<Vitals[]>([]);
  latestVitals = signal<Vitals | null>(null);
  selectedPatientId = 0;

  showModal = signal(false);
  newVitals = {
    bloodPressure: '120/80',
    heartRate: 74,
    temperature: 36.8,
    oxygenSaturation: 98,
    bloodGlucose: 115,
    heightCm: 170,
    weightKg: 70
  };

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {}

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  ngOnInit(): void {
    if (this.isPatient()) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          if (p) {
            this.selectedPatientId = p.id;
            this.loadVitals(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadVitals(active.id);
      }
    }
  }

  canRecordVitals(): boolean {
    return this.authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR']);
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadVitals(this.selectedPatientId);
    } else {
      this.vitalsList.set([]);
      this.latestVitals.set(null);
    }
  }

  loadVitals(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe(v => {
      this.vitalsList.set(v);
      if (v.length > 0) {
        this.latestVitals.set(v[0]);
      } else {
        this.latestVitals.set(null);
      }
    });
  }

  saveVitals(): void {
    if (this.selectedPatientId === 0) return;
    this.apiService.recordVitals({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      bloodPressure: this.newVitals.bloodPressure,
      heartRate: Number(this.newVitals.heartRate),
      temperature: Number(this.newVitals.temperature),
      oxygenSaturation: Number(this.newVitals.oxygenSaturation),
      bloodGlucose: Number(this.newVitals.bloodGlucose),
      heightCm: Number(this.newVitals.heightCm),
      weightKg: Number(this.newVitals.weightKg)
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadVitals(Number(this.selectedPatientId));
      }
    });
  }
}
