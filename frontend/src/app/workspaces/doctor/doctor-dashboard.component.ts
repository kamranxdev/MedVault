import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHospital,
  lucideStethoscope,
  lucidePill,
  lucideListChecks,
  lucideCalendarClock,
  lucideChevronRight,
  lucideUsers,
  lucideSparkles,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ActionButtonComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHospital,
      lucideStethoscope,
      lucidePill,
      lucideListChecks,
      lucideCalendarClock,
      lucideChevronRight,
      lucideUsers,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Doctor Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ng-icon name="lucideHospital" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Dr. {{ currentUser?.fullName }}
              <span hlmBadge variant="secondary" class="text-[11px]">Physician Desk</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Active Clinical Shift & Provider Command Center</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-lg border border-border bg-card text-center min-w-[110px]">
            <span class="text-xl font-semibold text-foreground block leading-none">{{ patientCount() }}</span>
            <span class="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5 block">MPI Census</span>
          </div>

          <app-action-button
            variant="outline"
            size="sm"
            [loading]="generating()"
            (action)="generateSyntheticCohort()"
            customClass="gap-2">
            <ng-icon name="lucideSparkles" size="14" />
            <span>{{ generating() ? 'Generating...' : 'Add Cohort' }}</span>
          </app-action-button>
        </div>
      </div>

      <!-- Physician Workspaces -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a routerLink="/patients" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideStethoscope" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Patient Charts (MPI)</h3>
            <p class="text-xs text-muted-foreground mt-1">EHR chart summaries & patient search.</p>
          </div>
        </a>

        <a routerLink="/prescriptions" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucidePill" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Pharmacy & eRx Orders</h3>
            <p class="text-xs text-muted-foreground mt-1">Issue eRx with drug safety validation.</p>
          </div>
        </a>

        <a routerLink="/diagnoses" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideListChecks" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Problem List (ICD-10)</h3>
            <p class="text-xs text-muted-foreground mt-1">ICD-10 & SNOMED coded conditions.</p>
          </div>
        </a>

        <a routerLink="/appointments" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Consultation Schedule</h3>
            <p class="text-xs text-muted-foreground mt-1">Provider appointment calendar.</p>
          </div>
        </a>
      </div>

      <!-- Active Patient Census -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideUsers" size="18" class="text-muted-foreground" />
            <h3 class="text-sm font-semibold text-foreground">Active Patient Census</h3>
          </div>
          <a routerLink="/patients" hlmBtn variant="ghost" size="sm" class="h-7 text-xs">View All Patients</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" *ngIf="patients().length > 0">
          <div *ngFor="let p of patients().slice(0, 3)" class="p-4 rounded-lg border border-border bg-muted/20 flex flex-col justify-between space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-sm font-semibold text-foreground block">{{ p.fullName }}</span>
                <span class="text-[11px] font-mono text-muted-foreground block">MRN: {{ p.patientCode }}</span>
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">{{ p.bloodType }}</span>
            </div>
            <button hlmBtn variant="secondary" size="sm" (click)="selectPatient(p)" class="w-full h-7 text-[11px]">
              Open Patient Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DoctorDashboardComponent implements OnInit {
  patients = signal<Patient[]>([]);
  patientCount = signal(0);
  generating = signal(false);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe((pts) => {
      this.patients.set(pts);
      this.patientCount.set(pts.length);
    });
  }

  selectPatient(p: Patient): void {
    this.patientContext.setActivePatient(p);
  }

  generateSyntheticCohort(): void {
    this.generating.set(true);
    this.apiService.generateSyntheticCohort(3).subscribe({
      next: () => {
        this.generating.set(false);
        this.apiService.getPatients().subscribe((pts) => {
          this.patients.set(pts);
          this.patientCount.set(pts.length);
        });
      },
      error: () => this.generating.set(false),
    });
  }
}
