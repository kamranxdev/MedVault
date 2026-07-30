import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Prescription, SafetyCheckResult } from '../../core/models/models';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-capsule-line text-2xl text-emerald-400"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Active Prescriptions & Refills' : 'Pharmacy & Electronic Prescriptions (eRx)' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {{ isPatient() ? 'View your prescribed medications, dosage details, refills, and prescribing doctor instructions.' : 'Order entry with real-time Smart Safety contraindication alerts cross-checking patient allergy profiles.' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Patient Selector (Clinicians Only) -->
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500">
            <option [value]="0">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="authService.hasRole('ROLE_DOCTOR')" 
            (click)="showModal.set(true)" 
            [disabled]="selectedPatientId === 0"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <span>+</span> Issue eRx Order
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="selectedPatientId === 0" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view electronic prescription history.</p>
      </div>

      <div *ngIf="selectedPatientId > 0" class="space-y-4">
        <!-- Prescription Cards Grid -->
        <div *ngFor="let rx of prescriptions()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
                {{ rx.medicationName }}
                <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">
                  {{ rx.dosage }}
                </span>
                <span *ngIf="rx.rxNormCode" class="text-xs font-mono text-slate-400">
                  RxNorm: {{ rx.rxNormCode }}
                </span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Route: {{ rx.route || 'Oral' }} | Refills Remaining: {{ rx.refills || 0 }}</p>
            </div>

            <span [class]="rx.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'" class="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider">
              {{ rx.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-3xs font-bold text-slate-400 uppercase tracking-wider">Frequency & Duration</span>
              <p class="text-white font-semibold mt-0.5">{{ rx.frequency }} ({{ rx.durationDays }} days)</p>
            </div>
            <div>
              <span class="text-3xs font-bold text-slate-400 uppercase tracking-wider">Authorizing Physician</span>
              <p class="text-slate-200 font-semibold mt-0.5">{{ rx.doctor?.fullName || 'Dr. Sarah Jenkins' }}</p>
            </div>
          </div>

          <div *ngIf="rx.instructions" class="p-3 bg-slate-800/60 rounded-2xl text-slate-300 text-xs border border-slate-800">
            <span class="font-bold text-white">Instructions:</span> {{ rx.instructions }}
          </div>
        </div>

        <div *ngIf="prescriptions().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No active or past electronic prescriptions logged on file.</p>
        </div>
      </div>

      <!-- Prescribe Modal (Doctor Only) -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-emerald-400">Issue Electronic Prescription (eRx)</h3>
            <button (click)="showModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <form (ngSubmit)="handlePrescriptionSubmit()" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Medication Name *</label>
              <input type="text" [(ngModel)]="newRx.medicationName" name="medicationName" placeholder="e.g. Amoxicillin, Lisinopril, Metformin..." required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Dosage *</label>
                <input type="text" [(ngModel)]="newRx.dosage" name="dosage" placeholder="500 mg" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Route</label>
                <select [(ngModel)]="newRx.route" name="route" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="Oral">Oral (PO)</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="Subcutaneous">Subcutaneous (SC)</option>
                  <option value="Topical">Topical</option>
                  <option value="Inhalation">Inhalation</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Frequency *</label>
                <input type="text" [(ngModel)]="newRx.frequency" name="frequency" placeholder="Twice daily" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Duration (Days)</label>
                <input type="number" [(ngModel)]="newRx.durationDays" name="durationDays" placeholder="30" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Refills</label>
                <input type="number" [(ngModel)]="newRx.refills" name="refills" placeholder="2" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Patient Instructions</label>
              <textarea [(ngModel)]="newRx.instructions" name="instructions" rows="2" placeholder="Take after meals with water..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Authorize eRx Order</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Smart Allergy Safety Engine Contraindication Alert Modal -->
      <div *ngIf="safetyAlert()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4">
          <div class="flex items-center gap-3 text-rose-400">
            <i class="ri-alarm-warning-fill text-3xl text-rose-400"></i>
            <div>
              <h3 class="text-lg font-bold">CONTRAINDICATION SAFETY WARNING</h3>
              <p class="text-xs text-rose-300 font-semibold uppercase">Smart Allergy Cross-Checking Engine</p>
            </div>
          </div>

          <div class="p-4 bg-rose-950/60 border border-rose-600/60 rounded-2xl text-xs text-rose-100 space-y-2">
            <p><strong>Conflicting Active Allergen:</strong> {{ safetyAlert()?.conflictingAllergen || 'Known Drug Allergy' }}</p>
            <p><strong>Severity Rating:</strong> <span class="uppercase font-bold text-rose-400">{{ safetyAlert()?.severity }}</span></p>
            <p class="text-xs">{{ safetyAlert()?.message }}</p>
          </div>

          <p class="text-xs text-slate-400">
            Issuing this prescription poses high clinical risk for adverse reactions. Proceeding will log a high-priority <code class="bg-slate-800 px-1 py-0.5 rounded text-rose-400">ERX_ALERT</code> in the WORM Compliance Ledger.
          </p>

          <div class="flex justify-end gap-3 pt-2">
            <button (click)="safetyAlert.set(null)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
              Cancel Prescription
            </button>
            <button (click)="forceSavePrescription()" class="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg">
              Authorize Override (Log Audit)
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrescriptionsComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
  selectedPatientId = 0;

  showModal = signal(false);
  safetyAlert = signal<SafetyCheckResult | null>(null);

  newRx = {
    medicationName: '',
    dosage: '500 mg',
    route: 'Oral',
    frequency: 'Twice Daily',
    durationDays: 30,
    refills: 2,
    instructions: ''
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
            this.loadRx(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadRx(active.id);
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadRx(this.selectedPatientId);
    } else {
      this.prescriptions.set([]);
    }
  }

  loadRx(patientId: number): void {
    this.apiService.getPrescriptionsByPatient(patientId).subscribe(rx => this.prescriptions.set(rx));
  }

  handlePrescriptionSubmit(): void {
    if (!this.newRx.medicationName || this.selectedPatientId === 0) return;

    this.apiService.checkPrescriptionSafety(this.selectedPatientId, this.newRx.medicationName).subscribe({
      next: (safety) => {
        if (!safety.safe) {
          this.safetyAlert.set(safety);
        } else {
          this.executeSave(false);
        }
      },
      error: () => this.executeSave(false)
    });
  }

  forceSavePrescription(): void {
    this.executeSave(true);
  }

  private executeSave(overrideWarning: boolean): void {
    this.apiService.createPrescription({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      medicationName: this.newRx.medicationName,
      dosage: this.newRx.dosage,
      route: this.newRx.route,
      frequency: this.newRx.frequency,
      durationDays: Number(this.newRx.durationDays),
      refills: Number(this.newRx.refills),
      instructions: this.newRx.instructions,
      status: 'ACTIVE'
    }, overrideWarning).subscribe({
      next: () => {
        this.showModal.set(false);
        this.safetyAlert.set(null);
        this.newRx = { medicationName: '', dosage: '500 mg', route: 'Oral', frequency: 'Twice Daily', durationDays: 30, refills: 2, instructions: '' };
        this.loadRx(this.selectedPatientId);
      }
    });
  }
}
