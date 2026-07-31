import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
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
import { lucidePlus, lucideListChecks, lucideLoader2, lucideAlertCircle } from '@ng-icons/lucide';

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
    HasRoleDirective,
    HasAnyRoleDirective,
    NgIcon
  ],
  providers: [
    provideIcons({ lucidePlus, lucideListChecks, lucideLoader2, lucideAlertCircle })
  ],
  templateUrl: './diagnoses.component.html',
  styleUrl: './diagnoses.component.css'
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

  statusOptions = ['CHRONIC', 'ACTIVE', 'REMISSION', 'RESOLVED'];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService
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
}
