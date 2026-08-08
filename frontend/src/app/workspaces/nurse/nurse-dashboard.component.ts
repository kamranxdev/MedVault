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
  lucideActivity,
  lucideTriangleAlert,
  lucidePill,
  lucideUserRound,
  lucideCalendarClock,
  lucideChevronRight,
  lucideUsers,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHospital,
      lucideActivity,
      lucideTriangleAlert,
      lucidePill,
      lucideUserRound,
      lucideCalendarClock,
      lucideChevronRight,
      lucideUsers,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Nurse Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucideHospital" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Welcome, Nurse {{ currentUser?.fullName }}
              <span hlmBadge variant="secondary" class="text-[11px]">Nursing Station</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Active Unit Clinical Shift & Bedside Triage Operations</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg border border-border bg-card text-center min-w-[110px]">
            <span class="text-xl font-semibold text-foreground block leading-none">{{ patientCount() }}</span>
            <span class="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5 block">Unit Census</span>
          </div>
        </div>
      </div>

      <!-- Station Workspaces -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a routerLink="/appointments" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideActivity" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Nursing Triage Vitals</h3>
            <p class="text-xs text-muted-foreground mt-1">Pre-consultation vitals intake & notes.</p>
          </div>
        </a>

        <a routerLink="/vitals" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideActivity" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Bedside Vitals Flowsheet</h3>
            <p class="text-xs text-muted-foreground mt-1">Log BP, Heart Rate, SpO2 & BMI.</p>
          </div>
        </a>

        <a routerLink="/allergies" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideTriangleAlert" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Coded Allergies & ADRs</h3>
            <p class="text-xs text-muted-foreground mt-1">Document allergen safety register.</p>
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
            <h3 class="text-sm font-semibold text-foreground">Medication MAR Orders</h3>
            <p class="text-xs text-muted-foreground mt-1">Verify eRx orders & status.</p>
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
export class NurseDashboardComponent implements OnInit {
  patients = signal<Patient[]>([]);
  patientCount = signal(0);

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
}
