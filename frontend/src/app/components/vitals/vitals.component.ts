import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Vitals } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideActivity, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-vitals',
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
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideActivity, lucideAlertCircle })],
  templateUrl: './vitals.component.html',
  styleUrl: './vitals.component.css',
})
export class VitalsComponent implements OnInit {
  vitalsList = signal<Vitals[]>([]);
  latestVitals = signal<Vitals | null>(null);
  selectedPatientId = 0;

  showModal = signal(false);
  newVitals = {
    bloodPressure: '120/80',
    heartRate: 74,
    temperature: 36.8,
    oxygenSaturation: 98,
    bloodGlucose: 115,
    heightCm: 170,
    weightKg: 70,
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
        this.loadVitals(active.id);
      }
    });
  }

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  canRecordVitals(): boolean {
    return this.authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_NURSE', 'ROLE_DOCTOR']);
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
        this.loadVitals(this.selectedPatientId);
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
            this.loadVitals(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      const list = this.patientContext.patientList();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadVitals(active.id);
      } else if (list.length > 0) {
        this.selectedPatientId = list[0].id;
        this.loadVitals(list[0].id);
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId > 0) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadVitals(this.selectedPatientId);
    } else {
      this.vitalsList.set([]);
      this.latestVitals.set(null);
    }
  }

  loadVitals(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe((v) => {
      this.vitalsList.set(v);
      if (v.length > 0) {
        this.latestVitals.set(v[0]);
      } else {
        this.latestVitals.set(null);
      }
    });
  }

  saveVitals(): void {
    if (this.selectedPatientId === 0) return;
    this.apiService
      .recordVitals({
        patient: { id: Number(this.selectedPatientId) } as Patient,
        bloodPressure: this.newVitals.bloodPressure,
        heartRate: Number(this.newVitals.heartRate),
        temperature: Number(this.newVitals.temperature),
        oxygenSaturation: Number(this.newVitals.oxygenSaturation),
        bloodGlucose: Number(this.newVitals.bloodGlucose),
        heightCm: Number(this.newVitals.heightCm),
        weightKg: Number(this.newVitals.weightKg),
      })
      .subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadVitals(Number(this.selectedPatientId));
        },
      });
  }
}
