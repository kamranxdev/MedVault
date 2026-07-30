import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Diagnosis, Patient } from '../../core/models/models';

@Component({
  selector: 'app-diagnoses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-list-check-2 text-2xl text-purple-500"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Problem List' : 'Problem List & ICD-10 Diagnoses' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            ICD-10 & SNOMED CT coded condition management, onset dates, and active clinical problem tracking.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500">
            <option [value]="null">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="authService.hasRole('ROLE_DOCTOR')"
            (click)="showModal = true"
            [disabled]="!selectedPatientId"
            class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <i class="ri-add-line"></i> Add Diagnosis
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!selectedPatientId" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view problem lists and diagnoses.</p>
      </div>

      <div *ngIf="selectedPatientId" class="space-y-4">
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p class="text-slate-400 text-xs mt-2">Loading problem list...</p>
        </div>

        <div *ngIf="!loading() && diagnoses().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No active or chronic diagnoses recorded for this patient.</p>
        </div>

        <!-- Diagnoses Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="!loading()">
          <div *ngFor="let dx of diagnoses()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-purple-400 flex items-center gap-2">
                  {{ dx.conditionName }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 bg-slate-800 text-indigo-400 font-mono text-xs rounded">ICD-10: {{ dx.icdCode }}</span>
                  <span *ngIf="dx.snomedCode" class="px-2 py-0.5 bg-slate-800 text-teal-400 font-mono text-xs rounded">SNOMED: {{ dx.snomedCode }}</span>
                </div>
              </div>

              <span [class]="getStatusBadge(dx.status)" class="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider">
                {{ dx.status }}
              </span>
            </div>

            <p *ngIf="dx.notes" class="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
              <span class="font-bold text-white">Clinical Notes:</span> {{ dx.notes }}
            </p>

            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Onset: <strong>{{ dx.onsetDate | date:'mediumDate' }}</strong></span>
              <span>Provider: {{ dx.doctor?.fullName || 'Dr. Sarah Jenkins' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Diagnosis Modal -->
      <div *ngIf="showModal && authService.hasRole('ROLE_DOCTOR')" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-purple-400">Add ICD-10 Coded Diagnosis</h3>
            <button (click)="showModal = false" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
          </div>

          <form (ngSubmit)="saveDiagnosis()" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Condition / Disease Name *</label>
              <input [(ngModel)]="newDx.conditionName" name="conditionName" required placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">ICD-10 Code *</label>
                <input [(ngModel)]="newDx.icdCode" name="icdCode" required placeholder="e.g. E11.9, I10" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">SNOMED CT Code</label>
                <input [(ngModel)]="newDx.snomedCode" name="snomedCode" placeholder="e.g. 44054006" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Onset Date</label>
                <input type="date" [(ngModel)]="newDx.onsetDate" name="onsetDate" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Clinical Status</label>
                <select [(ngModel)]="newDx.status" name="status" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="CHRONIC">Chronic</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REMISSION">Remission</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Clinical Notes & Management Plan</label>
              <textarea [(ngModel)]="newDx.notes" name="notes" rows="3" placeholder="Managed with quarterly glycemic monitoring..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl">Save Diagnosis</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DiagnosesComponent implements OnInit {
  diagnoses = signal<Diagnosis[]>([]);
  selectedPatientId: number | null = null;
  loading = signal<boolean>(false);
  showModal = false;

  newDx: Partial<Diagnosis> = {
    conditionName: '',
    icdCode: '',
    snomedCode: '',
    onsetDate: '2026-01-01',
    status: 'ACTIVE',
    notes: ''
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
            this.loadDiagnoses();
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadDiagnoses();
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadDiagnoses();
    } else {
      this.diagnoses.set([]);
    }
  }

  loadDiagnoses(): void {
    if (!this.selectedPatientId) return;
    this.loading.set(true);
    this.apiService.getDiagnosesByPatient(Number(this.selectedPatientId)).subscribe({
      next: (res) => {
        this.diagnoses.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveDiagnosis(): void {
    if (!this.selectedPatientId) return;
    this.newDx.patient = { id: Number(this.selectedPatientId) } as Patient;
    this.apiService.createDiagnosis(this.newDx).subscribe(() => {
      this.showModal = false;
      this.newDx = { conditionName: '', icdCode: '', snomedCode: '', onsetDate: '2026-01-01', status: 'ACTIVE', notes: '' };
      this.loadDiagnoses();
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'CHRONIC': return 'bg-amber-500/20 text-amber-500 border border-amber-500/30';
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'REMISSION': return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'RESOLVED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  }
}
