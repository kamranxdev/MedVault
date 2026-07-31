import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Diagnosis, Patient } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-diagnoses',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, ButtonModule, TagModule, CardModule, MessageModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule],
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
