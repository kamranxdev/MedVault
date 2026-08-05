import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Prescription, SafetyCheckResult } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucidePill, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon
  ],
  providers: [
    provideIcons({ lucidePlus, lucidePill, lucideAlertCircle })
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.css'
})
export class PrescriptionsComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
  selectedPatientId = 0;

  showModal = signal(false);
  showSafetyModal = signal(false);
  safetyAlert = signal<SafetyCheckResult | null>(null);
  inlineSafetyCheck = signal<SafetyCheckResult | null>(null);
  overrideJustification = '';

  newRx = {
    medicationName: '',
    dosage: '500 mg',
    route: 'Oral',
    frequency: 'Twice Daily',
    durationDays: 30,
    refills: 2,
    instructions: ''
  };

  routes = [
    { label: 'Oral (PO)', value: 'Oral' },
    { label: 'Intravenous (IV)', value: 'IV' },
    { label: 'Subcutaneous (SC)', value: 'Subcutaneous' },
    { label: 'Topical', value: 'Topical' },
    { label: 'Inhalation', value: 'Inhalation' }
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && !this.isPatient()) {
        this.selectedPatientId = active.id;
        this.loadRx(active.id);
      }
    });
  }

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  canAddPrescription(): boolean {
    return this.authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR']);
  }

  openModal(): void {
    if (this.selectedPatientId === 0) {
      const active = this.patientContext.activePatient();
      const list = this.patientContext.patientList();
      if (active) {
        this.selectedPatientId = active.id;
      } else if (list.length > 0) {
        this.selectedPatientId = list[0].id;
      }
      if (this.selectedPatientId > 0) {
        this.loadRx(this.selectedPatientId);
      }
    }
    this.showModal.set(true);
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
      const list = this.patientContext.patientList();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadRx(active.id);
      } else if (list.length > 0) {
        this.selectedPatientId = list[0].id;
        this.loadRx(list[0].id);
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

  onMedicationInputChange(): void {
    if (!this.newRx.medicationName || this.newRx.medicationName.trim().length < 3 || this.selectedPatientId === 0) {
      this.inlineSafetyCheck.set(null);
      return;
    }

    this.apiService.validatePrescriptionSafety(this.selectedPatientId, this.newRx.medicationName).subscribe({
      next: (res) => this.inlineSafetyCheck.set(res),
      error: () => this.inlineSafetyCheck.set(null)
    });
  }

  handlePrescriptionSubmit(): void {
    if (!this.newRx.medicationName || this.selectedPatientId === 0) return;

    this.apiService.checkPrescriptionSafety(this.selectedPatientId, this.newRx.medicationName).subscribe({
      next: (safety) => {
        if (!safety.safe) {
          this.safetyAlert.set(safety);
          this.showSafetyModal.set(true);
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

  closeSafetyModal(): void {
    this.showSafetyModal.set(false);
    this.safetyAlert.set(null);
  }

  private executeSave(overrideWarning: boolean): void {
    let finalInstructions = this.newRx.instructions;
    if (overrideWarning && this.overrideJustification) {
      finalInstructions += " [CLINICAL OVERRIDE RATIONALE: " + this.overrideJustification + "]";
    }

    this.apiService.createPrescription({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      medicationName: this.newRx.medicationName,
      dosage: this.newRx.dosage,
      route: this.newRx.route,
      frequency: this.newRx.frequency,
      durationDays: Number(this.newRx.durationDays),
      refills: Number(this.newRx.refills),
      instructions: finalInstructions,
      status: 'ACTIVE'
    }, overrideWarning).subscribe({
      next: () => {
        this.showModal.set(false);
        this.showSafetyModal.set(false);
        this.safetyAlert.set(null);
        this.inlineSafetyCheck.set(null);
        this.overrideJustification = '';
        this.newRx = { medicationName: '', dosage: '500 mg', route: 'Oral', frequency: 'Twice Daily', durationDays: 30, refills: 2, instructions: '' };
        this.loadRx(this.selectedPatientId);
      }
    });
  }
}
