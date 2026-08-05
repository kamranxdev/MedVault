import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Encounter, Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideHospital, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-encounters',
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
    provideIcons({ lucidePlus, lucideHospital, lucideAlertCircle })
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

  canLogEncounter(): boolean {
    return this.authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE']);
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
        this.loadEncounters(this.selectedPatientId);
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
            this.loadEncounters(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      const list = this.patientContext.patientList();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadEncounters(active.id);
      } else if (list.length > 0) {
        this.selectedPatientId = list[0].id;
        this.loadEncounters(list[0].id);
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
}
