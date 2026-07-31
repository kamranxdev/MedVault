import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { Allergy, Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideLoader2, lucideAlertCircle, lucideTriangleAlert } from '@ng-icons/lucide';

@Component({
  selector: 'app-allergies',
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
    provideIcons({ lucidePlus, lucideLoader2, lucideAlertCircle, lucideTriangleAlert })
  ],
  templateUrl: './allergies.component.html',
  styleUrl: './allergies.component.css'
})
export class AllergiesComponent implements OnInit {
  allergies = signal<Allergy[]>([]);
  selectedPatientId: number | null = null;
  loading = signal<boolean>(false);
  showModal = false;

  newAlg: Partial<Allergy> = {
    allergenName: '',
    allergenCode: '',
    category: 'DRUG',
    severity: 'SEVERE',
    reactionDescription: '',
    status: 'ACTIVE'
  };

  categoryOptions = [
    { label: 'Drug / Medication', value: 'DRUG' },
    { label: 'Food Allergy', value: 'FOOD' },
    { label: 'Environmental', value: 'ENVIRONMENTAL' },
    { label: 'Other Allergen', value: 'OTHER' }
  ];

  severityOptions = [
    { label: 'Mild', value: 'MILD' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Severe', value: 'SEVERE' },
    { label: 'Life Threatening', value: 'LIFE_THREATENING' }
  ];

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Resolved', value: 'RESOLVED' }
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
        this.loadAllergies();
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
            this.loadAllergies();
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadAllergies();
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadAllergies();
    } else {
      this.allergies.set([]);
    }
  }

  loadAllergies(): void {
    if (!this.selectedPatientId) return;
    this.loading.set(true);
    this.apiService.getAllergiesByPatient(Number(this.selectedPatientId)).subscribe({
      next: (res) => {
        this.allergies.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveAllergy(): void {
    if (!this.selectedPatientId) return;
    this.newAlg.patient = { id: Number(this.selectedPatientId) } as Patient;
    this.apiService.createAllergy(this.newAlg).subscribe(() => {
      this.showModal = false;
      this.newAlg = { allergenName: '', allergenCode: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };
      this.loadAllergies();
    });
  }
}
