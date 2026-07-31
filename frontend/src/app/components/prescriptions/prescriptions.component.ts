import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { Patient, Prescription, SafetyCheckResult } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    TagModule,
    CardModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    MessageModule,
    HasRoleDirective,
    HasAnyRoleDirective
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
        this.showSafetyModal.set(false);
        this.safetyAlert.set(null);
        this.newRx = { medicationName: '', dosage: '500 mg', route: 'Oral', frequency: 'Twice Daily', durationDays: 30, refills: 2, instructions: '' };
        this.loadRx(this.selectedPatientId);
      }
    });
  }
}
