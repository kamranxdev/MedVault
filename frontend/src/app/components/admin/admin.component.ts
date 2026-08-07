import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User, AuditLog } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideUserCheck,
  lucideShieldCheck,
  lucideUsers,
  lucidePlus,
  lucideAlertCircle,
  lucideDatabase,
  lucideCpu,
  lucideCheckCircle,
  lucideUploadCloud,
  lucidePlay,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin',
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
  providers: [
    provideIcons({
      lucideSettings,
      lucideUserCheck,
      lucideShieldCheck,
      lucideUsers,
      lucidePlus,
      lucideAlertCircle,
      lucideDatabase,
      lucideCpu,
      lucideCheckCircle,
      lucideUploadCloud,
      lucidePlay,
    }),
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  auditLogs = signal<AuditLog[]>([]);

  showCreateUserModal = signal(false);
  showIngestModal = signal(false);
  errorMessage = signal<string | null>(null);

  // Synthea Pipeline Signals & State
  syntheaStatus = signal<any>(null);
  isGeneratingSynthea = signal(false);
  syntheaResult = signal<any>(null);
  syntheaCount = 3;
  syntheaState = 'Massachusetts';
  rawFhirJson = '';

  syntheaStates = ['Massachusetts', 'New York', 'California', 'Texas', 'Florida', 'Illinois'];

  newUser = {
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'DOCTOR',
    specialization: 'Cardiology',
    department: 'Cardiology Dept',
    licenseNumber: 'MD-749201-NY',
    qualifications: 'MD, FACC, Board Certified',
    yearsOfExperience: 10,
    medicalBoardState: 'New York Medical Board',
  };

  roles = [
    { label: 'Physician (DOCTOR)', value: 'DOCTOR' },
    { label: 'Nurse Staff (NURSE)', value: 'NURSE' },
    { label: 'Administrator (ADMIN)', value: 'ADMIN' },
    { label: 'Compliance Auditor (AUDITOR)', value: 'AUDITOR' },
  ];

  specializations = [
    'Cardiology',
    'Pulmonology',
    'Endocrinology',
    'Orthopedics',
    'Dermatology',
    'Neurology',
    'Gastroenterology',
    'Nephrology',
    'General Practice',
    'Internal Medicine',
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadSyntheaStatus();
    this.apiService.getAuditLogs().subscribe((l) => this.auditLogs.set(l));
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe((u) => this.users.set(u));
  }

  loadSyntheaStatus(): void {
    this.apiService.getSyntheaPipelineStatus().subscribe({
      next: (status) => this.syntheaStatus.set(status),
      error: (err) => console.error('Failed to load Synthea status:', err),
    });
  }

  getRoleCount(role: string): number {
    return this.users().filter((u) => u.roles.includes(role)).length;
  }

  handleRunSyntheaPipeline(): void {
    this.isGeneratingSynthea.set(true);
    this.syntheaResult.set(null);

    this.apiService.generateSyntheaPipeline(this.syntheaCount, this.syntheaState).subscribe({
      next: (res) => {
        this.isGeneratingSynthea.set(false);
        this.syntheaResult.set(res);
        this.loadSyntheaStatus();
      },
      error: (err) => {
        this.isGeneratingSynthea.set(false);
        this.syntheaResult.set({
          status: 'ERROR',
          message: err.error?.message || 'Synthea pipeline execution failed.',
        });
      },
    });
  }

  handleIngestRawFhirBundle(): void {
    if (!this.rawFhirJson || !this.rawFhirJson.trim()) return;

    this.isGeneratingSynthea.set(true);
    this.apiService.ingestSyntheaBundle(this.rawFhirJson).subscribe({
      next: (res) => {
        this.isGeneratingSynthea.set(false);
        this.showIngestModal.set(false);
        this.rawFhirJson = '';
        this.syntheaResult.set({
          status: 'SUCCESS',
          message: 'Raw FHIR Bundle successfully ingested into database.',
          patientsIngested: res.patientsCount || 1,
          encountersIngested: res.encountersCount || 0,
          allergiesIngested: res.allergiesCount || 0,
          conditionsIngested: res.conditionsCount || 0,
          prescriptionsIngested: res.prescriptionsCount || 0,
          vitalsIngested: res.vitalsCount || 0,
        });
        this.loadSyntheaStatus();
      },
      error: (err) => {
        this.isGeneratingSynthea.set(false);
        alert(err.error?.message || 'Failed to ingest FHIR Bundle.');
      },
    });
  }

  handleCreateUser(): void {
    this.errorMessage.set(null);

    if (
      !this.newUser.username ||
      !this.newUser.password ||
      !this.newUser.email ||
      !this.newUser.fullName
    ) {
      this.errorMessage.set('Please fill out all required basic account credentials.');
      return;
    }

    if (this.newUser.role === 'DOCTOR') {
      if (!this.newUser.licenseNumber || !this.newUser.licenseNumber.trim()) {
        this.errorMessage.set(
          'Doctor registration requires a valid Medical Practice License Number!',
        );
        return;
      }
      if (!this.newUser.qualifications || !this.newUser.qualifications.trim()) {
        this.errorMessage.set(
          'Doctor registration requires documented Qualifications (e.g. MD, MBBS)!',
        );
        return;
      }
    }

    const payload = {
      username: this.newUser.username,
      password: this.newUser.password,
      email: this.newUser.email,
      fullName: this.newUser.fullName,
      specialization: this.newUser.specialization,
      department: this.newUser.department,
      licenseNumber: this.newUser.licenseNumber,
      qualifications: this.newUser.qualifications,
      yearsOfExperience: Number(this.newUser.yearsOfExperience),
      medicalBoardState: this.newUser.medicalBoardState,
      roles: [this.newUser.role],
    };

    this.authService.createStaffUser(payload).subscribe({
      next: () => {
        this.showCreateUserModal.set(false);
        this.loadUsers();
        this.newUser = {
          username: '',
          password: '',
          email: '',
          fullName: '',
          role: 'DOCTOR',
          specialization: 'Cardiology',
          department: 'Cardiology Dept',
          licenseNumber: 'MD-749201-NY',
          qualifications: 'MD, FACC, Board Certified',
          yearsOfExperience: 10,
          medicalBoardState: 'New York Medical Board',
        };
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create user account.');
      },
    });
  }
}
