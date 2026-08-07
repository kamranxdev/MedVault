import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from '../../core/directives/has-role.directive';
import { Appointment, Patient, Prescription, Vitals } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideHospital,
  lucideShieldCheck,
  lucideCalendarClock,
  lucideTriangleAlert,
  lucidePill,
  lucideActivity,
  lucideFileText,
  lucideFolderGit2,
  lucideStethoscope,
  lucideListChecks,
  lucideShield,
  lucideUsers,
  lucideArrowUpRight,
  lucideSparkles,
  lucideLoader2,
  lucideHeartPulse,
  lucideChevronRight,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
    HasRoleDirective,
    HasAnyRoleDirective,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideHospital,
      lucideShieldCheck,
      lucideCalendarClock,
      lucideTriangleAlert,
      lucidePill,
      lucideActivity,
      lucideFileText,
      lucideFolderGit2,
      lucideStethoscope,
      lucideListChecks,
      lucideShield,
      lucideUsers,
      lucideArrowUpRight,
      lucideSparkles,
      lucideLoader2,
      lucideHeartPulse,
      lucideChevronRight,
    }),
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && !this.authService.hasRole('ROLE_PATIENT')) {
        this.loadPatientMetrics(active.id);
      }
    });
  }

  private loadPatientMetrics(patientId: number): void {
    this.apiService
      .getPrescriptionsByPatient(patientId)
      .subscribe((rx) => this.activeRxCount.set(rx.length));
    this.apiService.getVitalsByPatient(patientId).subscribe((v) => {
      if (v.length > 0) this.latestVitals.set(v[v.length - 1]);
      else this.latestVitals.set(null);
    });
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_PATIENT')) {
      const u = this.currentUser;
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
          this.patient.set(p);
          if (p) {
            this.apiService
              .getPrescriptionsByPatient(p.id)
              .subscribe((rx) => this.activeRxCount.set(rx.length));
            this.apiService.getVitalsByPatient(p.id).subscribe((v) => {
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
      },
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
      error: () => this.generating.set(false),
    });
  }

  primaryRole(): string {
    const roles = this.currentUser?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'Admin / Reception';
    if (roles.includes('ROLE_DOCTOR')) return 'Physician / Clinician';
    if (roles.includes('ROLE_NURSE')) return 'Clinical Nurse';
    if (roles.includes('ROLE_AUDITOR')) return 'Compliance Auditor';
    return 'Patient Portal';
  }
}
