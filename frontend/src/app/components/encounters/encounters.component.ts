import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Encounter, Patient } from '../../core/models/models';

@Component({
  selector: 'app-encounters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-hospital-line text-2xl text-blue-400"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Visit & Consultation History' : 'Patient Encounters, Intake & Hospital Visits' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Inpatient, Outpatient, Emergency (ED), and Telehealth clinical consultation log registry.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500">
            <option [value]="0">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE'])" 
            (click)="showModal.set(true)" 
            [disabled]="selectedPatientId === 0"
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <span>+</span> Log Encounter / Intake
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="selectedPatientId === 0" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view visit history.</p>
      </div>

      <div *ngIf="selectedPatientId > 0" class="space-y-4">
        <!-- Encounter Cards -->
        <div *ngFor="let enc of encounters()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <span [class]="getEncounterTypeBadge(enc.encounterType)" class="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider">
                {{ enc.encounterType }}
              </span>
              <h3 class="text-base font-bold text-white">{{ enc.chiefComplaint }}</h3>
            </div>
            <span class="text-xs font-mono text-slate-400">
              Date: {{ enc.encounterDate | date:'medium' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-1">
              <span class="font-bold text-blue-400 uppercase tracking-wider text-3xs">Clinical Notes</span>
              <p class="text-slate-200 mt-1">{{ enc.clinicalNotes || 'No notes documented' }}</p>
            </div>

            <div class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-1">
              <span class="font-bold text-emerald-400 uppercase tracking-wider text-3xs">Discharge Summary / Instructions</span>
              <p class="text-slate-200 mt-1">{{ enc.dischargeSummary || 'Pending discharge' }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Attending Provider: <strong class="text-white">{{ enc.attendingProvider?.fullName || 'Dr. Sarah Jenkins' }}</strong></span>
            <span>Status: <strong class="text-emerald-400">{{ enc.status }}</strong></span>
          </div>
        </div>

        <div *ngIf="encounters().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No visit encounters logged for this patient.</p>
        </div>
      </div>

      <!-- Add Encounter Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-blue-400">Log Clinical Visit Encounter</h3>
            <button (click)="showModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <form (ngSubmit)="saveEncounter()" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Encounter Type *</label>
              <select [(ngModel)]="newEncounter.encounterType" name="encounterType" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                <option value="OUTPATIENT">Outpatient Consultation</option>
                <option value="INPATIENT">Inpatient Admission</option>
                <option value="EMERGENCY">Emergency Department (ED)</option>
                <option value="TELEHEALTH">Telehealth Consultation</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Chief Complaint *</label>
              <input type="text" [(ngModel)]="newEncounter.chiefComplaint" name="chiefComplaint" placeholder="e.g. Acute morning headache and hypertension" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Clinical Notes</label>
              <textarea [(ngModel)]="newEncounter.clinicalNotes" name="clinicalNotes" rows="3" placeholder="Evaluated patient in triage..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Discharge Summary</label>
              <textarea [(ngModel)]="newEncounter.dischargeSummary" name="dischargeSummary" rows="2" placeholder="Discharged with home BP tracking..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">Log Encounter</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EncountersComponent implements OnInit {
  encounters = signal<Encounter[]>([]);
  selectedPatientId = 0;
  showModal = signal(false);

  newEncounter = {
    encounterType: 'OUTPATIENT',
    chiefComplaint: '',
    clinicalNotes: '',
    dischargeSummary: '',
    status: 'COMPLETED'
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
            this.loadEncounters(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadEncounters(active.id);
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadEncounters(this.selectedPatientId);
    } else {
      this.encounters.set([]);
    }
  }

  loadEncounters(patientId: number): void {
    this.apiService.getEncountersByPatient(patientId).subscribe(e => this.encounters.set(e));
  }

  saveEncounter(): void {
    if (this.selectedPatientId === 0 || !this.newEncounter.chiefComplaint) return;
    this.apiService.createEncounter({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      encounterType: this.newEncounter.encounterType,
      chiefComplaint: this.newEncounter.chiefComplaint,
      clinicalNotes: this.newEncounter.clinicalNotes,
      dischargeSummary: this.newEncounter.dischargeSummary,
      status: this.newEncounter.status
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.newEncounter = { encounterType: 'OUTPATIENT', chiefComplaint: '', clinicalNotes: '', dischargeSummary: '', status: 'COMPLETED' };
        this.loadEncounters(this.selectedPatientId);
      }
    });
  }

  getEncounterTypeBadge(type: string): string {
    switch (type) {
      case 'EMERGENCY': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'INPATIENT': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'TELEHEALTH': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  }
}
