import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, Patient, Prescription, Vitals } from '../../core/models/models';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  patientCount = signal(0);
  recentPatients = signal<Patient[]>([]);
  generating = signal(false);

  patient = signal<Patient | null>(null);
  activeRxCount = signal(0);
  latestVitals = signal<Vitals | null>(null);

  constructor(
    public authService: AuthService, 
    private apiService: ApiService,
    public patientContext: PatientContextService
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_PATIENT')) {
      const u = this.currentUser;
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          this.patient.set(p);
          if (p) {
            this.apiService.getPrescriptionsByPatient(p.id).subscribe(rx => this.activeRxCount.set(rx.length));
            this.apiService.getVitalsByPatient(p.id).subscribe(v => {
              if (v.length > 0) this.latestVitals.set(v[v.length - 1]);
            });
          }
        });
      }
    } else {
      this.loadClinicianData();
    }
  }

  loadClinicianData(): void {
    this.apiService.getPatients().subscribe({
      next: (pts) => {
        this.patientCount.set(pts.length);
        this.recentPatients.set(pts);
      }
    });
  }

  selectPatientContext(p: Patient): void {
    this.patientContext.setActivePatient(p);
  }

  generateSyntheticCohort(): void {
    this.generating.set(true);
    this.apiService.generateSyntheticCohort(3).subscribe({
      next: () => {
        this.generating.set(false);
        this.loadClinicianData();
        this.patientContext.loadContext();
      },
      error: () => this.generating.set(false)
    });
  }

  primaryRole(): string {
    const roles = this.currentUser?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'ADMINISTRATOR / RECEPTION';
    if (roles.includes('ROLE_DOCTOR')) return 'PHYSICIAN / CLINICIAN';
    if (roles.includes('ROLE_NURSE')) return 'CLINICAL NURSE';
    if (roles.includes('ROLE_AUDITOR')) return 'COMPLIANCE AUDITOR';
    return 'PATIENT PORTAL';
  }

  getRoleBadgeClass(): string {
    const role = this.primaryRole();
    if (role.includes('ADMIN')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (role.includes('PHYSICIAN')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (role.includes('NURSE')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    if (role.includes('AUDITOR')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  }
}
