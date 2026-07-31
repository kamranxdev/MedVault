import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { MedicalRecord, Patient } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    SelectModule,
    TextareaModule,
    HasRoleDirective,
    HasAnyRoleDirective
  ],
  templateUrl: './records.component.html',
  styleUrl: './records.component.css'
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
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && !this.isPatient()) {
        this.selectedPatientId = active.id;
        this.loadRecords(active.id);
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
