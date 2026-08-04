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
import { lucideSettings, lucideUserCheck, lucideShieldCheck, lucideUsers, lucidePlus, lucideAlertCircle } from '@ng-icons/lucide';

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
    NgIcon
  ],
  providers: [
    provideIcons({ lucideSettings, lucideUserCheck, lucideShieldCheck, lucideUsers, lucidePlus, lucideAlertCircle })
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  auditLogs = signal<AuditLog[]>([]);

  showCreateUserModal = signal(false);
  errorMessage = signal<string | null>(null);

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
    medicalBoardState: 'New York Medical Board'
  };

  roles = [
    { label: 'Physician (DOCTOR)', value: 'DOCTOR' },
    { label: 'Nurse Staff (NURSE)', value: 'NURSE' },
    { label: 'Administrator (ADMIN)', value: 'ADMIN' },
    { label: 'Compliance Auditor (AUDITOR)', value: 'AUDITOR' }
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
    'Internal Medicine'
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.apiService.getAuditLogs().subscribe(l => this.auditLogs.set(l));
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe(u => this.users.set(u));
  }

  getRoleCount(role: string): number {
    return this.users().filter(u => u.roles.includes(role)).length;
  }

  handleCreateUser(): void {
    this.errorMessage.set(null);

    if (!this.newUser.username || !this.newUser.password || !this.newUser.email || !this.newUser.fullName) {
      this.errorMessage.set('Please fill out all required basic account credentials.');
      return;
    }

    if (this.newUser.role === 'DOCTOR') {
      if (!this.newUser.licenseNumber || !this.newUser.licenseNumber.trim()) {
        this.errorMessage.set('Doctor registration requires a valid Medical Practice License Number!');
        return;
      }
      if (!this.newUser.qualifications || !this.newUser.qualifications.trim()) {
        this.errorMessage.set('Doctor registration requires documented Qualifications (e.g. MD, MBBS)!');
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
      roles: [this.newUser.role]
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
          medicalBoardState: 'New York Medical Board'
        };
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create user account.');
      }
    });
  }
}
