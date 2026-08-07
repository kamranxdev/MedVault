import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Diagnosis, Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideStethoscope, lucideLoader2, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-diagnoses',
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
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideStethoscope, lucideLoader2, lucideAlertCircle })],
  templateUrl: './diagnoses.component.html',
  styleUrl: './diagnoses.component.css',
})
export class DiagnosesComponent implements OnInit {
  diagnoses = signal<Diagnosis[]>([]);
  selectedPatientId = 0;
  loading = signal<boolean>(false);
  showModal = signal(false);

  newDiagnosis = {
    conditionName: '',
    icdCode: '',
    onsetDate: '',
    notes: '',
    status: 'ACTIVE',
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
        this.loadDiagnoses();
      }
    });
  }

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  canAddDiagnosis(): boolean {
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
        this.loadDiagnoses();
      }
    }
    this.showModal.set(true);
  }

  ngOnInit(): void {
    if (this.isPatient()) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
          if (p) {
            this.selectedPatientId = p.id;
            this.loadDiagnoses();
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      const list = this.patientContext.patientList();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadDiagnoses();
      } else if (list.length > 0) {
        this.selectedPatientId = list[0].id;
        this.loadDiagnoses();
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadDiagnoses();
    } else {
      this.diagnoses.set([]);
    }
  }

  loadDiagnoses(): void {
    if (this.selectedPatientId === 0) return;
    this.loading.set(true);
    this.apiService.getDiagnosesByPatient(Number(this.selectedPatientId)).subscribe({
      next: (res) => {
        this.diagnoses.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveDiagnosis(): void {
    if (this.selectedPatientId === 0 || !this.newDiagnosis.conditionName) return;
    this.apiService
      .createDiagnosis({
        patient: { id: Number(this.selectedPatientId) } as Patient,
        conditionName: this.newDiagnosis.conditionName,
        icdCode: this.newDiagnosis.icdCode,
        onsetDate: this.newDiagnosis.onsetDate || new Date().toISOString().split('T')[0],
        status: this.newDiagnosis.status,
        notes: this.newDiagnosis.notes,
      })
      .subscribe(() => {
        this.showModal.set(false);
        this.newDiagnosis = {
          conditionName: '',
          icdCode: '',
          onsetDate: '',
          notes: '',
          status: 'ACTIVE',
        };
        this.loadDiagnoses();
      });
  }
}
