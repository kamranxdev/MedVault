import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { MedicalRecord, Patient } from '../../core/models/models';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-file-text-line text-2xl text-indigo-400"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My SOAP Clinical Notes & Progress History' : 'SOAP Progress Notes & EHR Clinical Documentation' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Subjective complaints, Objective vitals/exam findings, Assessment, and Plan of Care documentation.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500">
            <option [value]="0">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="authService.hasRole('ROLE_DOCTOR')" 
            (click)="showModal.set(true)" 
            [disabled]="selectedPatientId === 0"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <span>+</span> Document SOAP Progress Note
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="selectedPatientId === 0" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view clinical progress notes.</p>
      </div>

      <div *ngIf="selectedPatientId > 0" class="space-y-4">
        <!-- Records List -->
        <div *ngFor="let rec of records()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                {{ rec.diagnosis }}
                <span *ngIf="rec.icdCode" class="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded">
                  ICD-10: {{ rec.icdCode }}
                </span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Documented by: <strong>{{ rec.doctor?.fullName || 'Dr. Mahtab Khan' }}</strong></p>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {{ rec.createdAt | date:'medium' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-1">
              <span class="font-bold text-indigo-400 uppercase tracking-wider text-3xs">Subjective Symptoms</span>
              <p class="text-slate-200 mt-1">{{ rec.symptoms || 'None reported' }}</p>
            </div>

            <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-1">
              <span class="font-bold text-emerald-400 uppercase tracking-wider text-3xs">Assessment & Plan</span>
              <p class="text-slate-200 mt-1">{{ rec.treatmentPlan || 'Routine follow-up' }}</p>
            </div>
          </div>

          <div *ngIf="rec.notes" class="p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-300 border border-slate-800">
            <strong class="text-white block mb-1">Clinical Impressions:</strong>
            {{ rec.notes }}
          </div>
        </div>

        <div *ngIf="records().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No documented progress notes on file for this patient.</p>
        </div>
      </div>

      <!-- Add Record Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-indigo-400">Document SOAP Clinical Progress Note</h3>
            <button (click)="showModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <form (ngSubmit)="saveRecord()" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Primary Diagnosis / Chief Impression *</label>
              <input type="text" [(ngModel)]="newRecord.diagnosis" name="diagnosis" placeholder="e.g. Type 2 Diabetes Management & Assessment" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">ICD-10 Code</label>
              <input type="text" [(ngModel)]="newRecord.icdCode" name="icdCode" placeholder="e.g. E11.9" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Subjective Symptoms</label>
              <textarea [(ngModel)]="newRecord.symptoms" name="symptoms" rows="2" placeholder="Patient reports mild fatigue..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Assessment & Plan of Care</label>
              <textarea [(ngModel)]="newRecord.treatmentPlan" name="treatmentPlan" rows="2" placeholder="Continue Metformin 500mg daily..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Clinical Impressions / Notes</label>
              <textarea [(ngModel)]="newRecord.notes" name="notes" rows="2" placeholder="Good dietary discipline noted..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">Sign & Save Note</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RecordsComponent implements OnInit {
  records = signal<MedicalRecord[]>([]);
  selectedPatientId = 0;
  showModal = signal(false);

  newRecord = {
    diagnosis: '',
    icdCode: '',
    symptoms: '',
    treatmentPlan: '',
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
            this.loadRecords(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadRecords(active.id);
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadRecords(this.selectedPatientId);
    } else {
      this.records.set([]);
    }
  }

  loadRecords(patientId: number): void {
    this.apiService.getRecordsByPatient(patientId).subscribe(r => this.records.set(r));
  }

  saveRecord(): void {
    if (this.selectedPatientId === 0 || !this.newRecord.diagnosis) return;
    this.apiService.createRecord({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      diagnosis: this.newRecord.diagnosis,
      icdCode: this.newRecord.icdCode,
      symptoms: this.newRecord.symptoms,
      treatmentPlan: this.newRecord.treatmentPlan,
      notes: this.newRecord.notes
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.newRecord = { diagnosis: '', icdCode: '', symptoms: '', treatmentPlan: '', notes: '' };
        this.loadRecords(this.selectedPatientId);
      }
    });
  }
}
