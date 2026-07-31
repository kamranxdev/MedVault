import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Allergy, Patient } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-allergies',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    DialogModule, 
    ButtonModule, 
    TagModule, 
    CardModule, 
    InputTextModule, 
    SelectModule, 
    TextareaModule, 
    MessageModule, 
    ProgressSpinnerModule
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

  getSeveritySeverity(severity: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (severity) {
      case 'LIFE_THREATENING': return 'danger';
      case 'SEVERE': return 'danger';
      case 'MODERATE': return 'warn';
      case 'MILD': return 'info';
      default: return 'info';
    }
  }

  getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch(category) {
      case 'DRUG': return 'info';
      case 'FOOD': return 'success';
      case 'ENVIRONMENTAL': return 'warn';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch(status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'secondary';
      case 'RESOLVED': return 'info';
      default: return 'secondary';
    }
  }
}
