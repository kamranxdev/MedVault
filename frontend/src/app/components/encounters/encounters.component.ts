import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { Encounter, Patient } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-encounters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    SelectModule,
    TextareaModule,
    CardModule,
    TagModule,
    MessageModule,
    DatePickerModule,
    HasRoleDirective,
    HasAnyRoleDirective
  ],
  templateUrl: './encounters.component.html',
  styleUrl: './encounters.component.css'
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

  encounterTypeOptions = [
    { label: 'Outpatient Consultation', value: 'OUTPATIENT' },
    { label: 'Inpatient Admission', value: 'INPATIENT' },
    { label: 'Emergency Department (ED)', value: 'EMERGENCY' },
    { label: 'Telehealth Consultation', value: 'TELEHEALTH' }
  ];

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && !this.isPatient()) {
        this.selectedPatientId = active.id;
        this.loadEncounters(active.id);
      }
    });
  }

  get patientOptions() {
    return [
      { label: 'Select Patient Profile...', value: 0 },
      ...this.patientContext.patientList().map(p => ({
        label: `${p.fullName} (MRN: ${p.patientCode})`,
        value: p.id
      }))
    ];
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

  getSeverity(type: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (type) {
      case 'EMERGENCY': return 'danger';
      case 'INPATIENT': return 'warn';
      case 'TELEHEALTH': return 'info';
      default: return 'success';
    }
  }
}
