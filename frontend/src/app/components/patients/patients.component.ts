import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { Patient, Vitals, Prescription, Encounter, Allergy, Diagnosis, SafetyCheckResult } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserPlus,
  lucidePlus,
  lucideSearch,
  lucideBarChart3,
  lucideBuilding,
  lucideTriangleAlert,
  lucideListChecks,
  lucideReceipt,
  lucideHeart,
  lucideUsers,
  lucideAlertCircle,
  lucideX,
  lucideCalendarClock,
  lucideActivity,
  lucidePill,
  lucideFileText,
  lucideStethoscope,
  lucideShieldCheck,
  lucideUserRound
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patients',
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
    HlmTabsImports,
    HasRoleDirective,
    HasAnyRoleDirective,
    NgIcon
  ],
  providers: [
    provideIcons({
      lucideUserPlus,
      lucidePlus,
      lucideSearch,
      lucideBarChart3,
      lucideBuilding,
      lucideTriangleAlert,
      lucideListChecks,
      lucideReceipt,
      lucideHeart,
      lucideUsers,
      lucideAlertCircle,
      lucideX,
      lucideCalendarClock,
      lucideActivity,
      lucidePill,
      lucideFileText,
      lucideStethoscope,
      lucideShieldCheck,
      lucideUserRound
    })
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  filteredPatients = signal<Patient[]>([]);
  searchQuery = '';

  selectedPatient = signal<Patient | null>(null);
  patientEncounters = signal<Encounter[]>([]);
  patientAllergies = signal<Allergy[]>([]);
  patientDiagnoses = signal<Diagnosis[]>([]);
  patientVitals = signal<Vitals[]>([]);
  patientRx = signal<Prescription[]>([]);

  chartTab = signal<'summary' | 'encounters' | 'allergies' | 'diagnoses' | 'rx' | 'vitals'>('summary');

  setChartTab(val: any): void {
    if (val) {
      this.chartTab.set(val);
    }
  }

  showIntakeModal = signal(false);
  showAllergyModal = signal(false);
  showDiagnosisModal = signal(false);
  showRxModal = signal(false);
  showEncounterModal = signal(false);
  showVitalsModal = signal(false);

  safetyAlert = signal<SafetyCheckResult | null>(null);

  newPatient: Partial<Patient> = { fullName: '', ssn: '', dateOfBirth: '1990-01-01', gender: 'Male', bloodType: 'O+', phone: '', email: '', insuranceProvider: 'BlueCross BlueShield', insurancePolicyNumber: 'BCBS-98741' };
  newAllergyInput: any = { allergenName: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };
  newDiagnosisInput: any = { conditionName: '', icdCode: '', onsetDate: '2026-01-01', notes: '', status: 'ACTIVE' };
  newRxInput: any = { medicationName: '', dosage: '500mg', route: 'Oral', frequency: 'Twice daily', durationDays: 7, refills: 1, status: 'ACTIVE' };
  newEncounterInput: any = { encounterType: 'OUTPATIENT', chiefComplaint: '', clinicalNotes: '', status: 'COMPLETED' };
  newVitalsInput: any = { bloodPressure: '120/80', heartRate: 72, temperature: 36.8, oxygenSaturation: 98, heightCm: 175, weightKg: 70, bloodGlucose: 95 };

  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  bloodTypeOptions = [
    { label: 'O+', value: 'O+' }, { label: 'A+', value: 'A+' }, { label: 'B+', value: 'B+' }, { label: 'AB+', value: 'AB+' },
    { label: 'O-', value: 'O-' }, { label: 'A-', value: 'A-' }, { label: 'B-', value: 'B-' }, { label: 'AB-', value: 'AB-' }
  ];

  allergyCategoryOptions = [
    { label: 'Medication', value: 'MEDICATION' },
    { label: 'Food', value: 'FOOD' },
    { label: 'Environmental', value: 'ENVIRONMENTAL' }
  ];

  severityOptions = [
    { label: 'Mild', value: 'MILD' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Severe', value: 'SEVERE' },
    { label: 'Life-Threatening', value: 'LIFE_THREATENING' }
  ];

  routeOptions = [
    { label: 'Oral', value: 'Oral' },
    { label: 'IV', value: 'IV' },
    { label: 'Subcutaneous', value: 'Subcutaneous' },
    { label: 'Topical', value: 'Topical' }
  ];

  encounterTypeOptions = [
    { label: 'Outpatient', value: 'OUTPATIENT' },
    { label: 'Inpatient', value: 'INPATIENT' },
    { label: 'Emergency', value: 'EMERGENCY' },
    { label: 'Telehealth', value: 'TELEHEALTH' }
  ];

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) {
        if (this.selectedPatient()?.id !== active.id) {
          this.selectPatient(active);
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_PATIENT')) {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectPatient(active);
      } else {
        const u = this.authService.currentUser();
        if (u) {
          this.apiService.getPatientByUserId(u.userId).subscribe(p => {
            if (p) this.selectPatient(p);
          });
        }
      }
    } else {
      this.loadPatients();
    }
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.filteredPatients.set(data);
        const active = this.patientContext.activePatient();
        if (active) {
          this.selectPatient(active);
        } else if (data.length > 0) {
          this.selectPatient(data[0]);
        }
      }
    });
  }

  executeMpiSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPatients.set(this.patients());
      return;
    }

    this.apiService.searchPatients(this.searchQuery).subscribe({
      next: (data) => this.filteredPatients.set(data)
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.patientContext.setActivePatient(patient);
    this.apiService.getEncountersByPatient(patient.id).subscribe(e => this.patientEncounters.set(e));
    this.apiService.getAllergiesByPatient(patient.id).subscribe(a => this.patientAllergies.set(a));
    this.apiService.getDiagnosesByPatient(patient.id).subscribe(d => this.patientDiagnoses.set(d));
    this.apiService.getVitalsByPatient(patient.id).subscribe(v => this.patientVitals.set(v));
    this.apiService.getPrescriptionsByPatient(patient.id).subscribe(rx => this.patientRx.set(rx));
  }

  savePatient(): void {
    if (!this.newPatient.fullName) return;

    if ((this.newPatient.dateOfBirth as any) instanceof Date) {
      this.newPatient.dateOfBirth = (this.newPatient.dateOfBirth as any).toISOString().split('T')[0];
    }

    this.apiService.createPatient(this.newPatient).subscribe({
      next: (p) => {
        this.showIntakeModal.set(false);
        this.loadPatients();
        this.selectPatient(p);
      }
    });
  }

  saveAllergy(): void {
    const p = this.selectedPatient();
    if (!p || !this.newAllergyInput.allergenName) return;
    const payload = { ...this.newAllergyInput, patient: { id: p.id } };
    this.apiService.createAllergy(payload).subscribe({
      next: () => {
        this.showAllergyModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveDiagnosis(): void {
    const p = this.selectedPatient();
    if (!p || !this.newDiagnosisInput.conditionName) return;

    let onset = this.newDiagnosisInput.onsetDate;
    if (onset instanceof Date) {
      onset = onset.toISOString().split('T')[0];
    }

    const payload = { ...this.newDiagnosisInput, onsetDate: onset, patient: { id: p.id } };
    this.apiService.createDiagnosis(payload).subscribe({
      next: () => {
        this.showDiagnosisModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  performSafetyCheckAndSaveRx(): void {
    const p = this.selectedPatient();
    if (!p || !this.newRxInput.medicationName) return;

    this.apiService.checkPrescriptionSafety(p.id, this.newRxInput.medicationName!).subscribe({
      next: (res) => {
        if (!res.safe) {
          this.safetyAlert.set(res);
        } else {
          this.confirmSaveRx();
        }
      }
    });
  }

  confirmOverrideRx(): void {
    this.confirmSaveRx(true);
  }

  confirmSaveRx(override = false): void {
    const p = this.selectedPatient();
    if (!p) return;
    const payload = { ...this.newRxInput, patient: { id: p.id } };
    this.apiService.createPrescription(payload, override).subscribe({
      next: () => {
        this.safetyAlert.set(null);
        this.showRxModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveEncounter(): void {
    const p = this.selectedPatient();
    if (!p || !this.newEncounterInput.chiefComplaint) return;
    const payload = { ...this.newEncounterInput, patient: { id: p.id } };
    this.apiService.createEncounter(payload).subscribe({
      next: () => {
        this.showEncounterModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveVitals(): void {
    const p = this.selectedPatient();
    if (!p) return;
    const payload = { ...this.newVitalsInput, patient: { id: p.id } };
    this.apiService.recordVitals(payload).subscribe({
      next: () => {
        this.showVitalsModal.set(false);
        this.selectPatient(p);
      }
    });
  }
}
