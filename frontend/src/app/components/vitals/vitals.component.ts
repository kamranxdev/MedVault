import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Vitals } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-vitals',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, ButtonModule, CardModule, TagModule, SelectModule, InputTextModule],
  templateUrl: './vitals.component.html',
  styleUrl: './vitals.component.css'
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
    weightKg: 70
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
            this.loadVitals(p.id);
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadVitals(active.id);
      }
    }
  }

  canRecordVitals(): boolean {
    return this.authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR']);
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
    this.apiService.getVitalsByPatient(patientId).subscribe(v => {
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
    this.apiService.recordVitals({
      patient: { id: Number(this.selectedPatientId) } as Patient,
      bloodPressure: this.newVitals.bloodPressure,
      heartRate: Number(this.newVitals.heartRate),
      temperature: Number(this.newVitals.temperature),
      oxygenSaturation: Number(this.newVitals.oxygenSaturation),
      bloodGlucose: Number(this.newVitals.bloodGlucose),
      heightCm: Number(this.newVitals.heightCm),
      weightKg: Number(this.newVitals.weightKg)
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadVitals(Number(this.selectedPatientId));
      }
    });
  }
}
