import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Vitals, Prescription } from '../../core/models/models';
import { StatCardComponent } from '../../shared/ui/stat-card.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideCalendarClock,
  lucideTriangleAlert,
  lucidePill,
  lucideActivity,
  lucideChevronRight,
  lucideHeartPulse,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-dashboard',
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
      lucideUserRound,
      lucideCalendarClock,
      lucideTriangleAlert,
      lucidePill,
      lucideActivity,
      lucideChevronRight,
      lucideHeartPulse,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ng-icon name="lucideUserRound" size="24" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">Welcome, {{ patient()?.fullName || currentUser?.fullName }}</h1>
              <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
            </div>
            <p class="text-xs text-muted-foreground flex items-center gap-2">
              <span>Medical Record Number (MRN):</span>
              <span hlmBadge variant="secondary" class="font-mono text-[11px]">{{ patient()?.patientCode || 'N/A' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <span class="text-[11px] text-muted-foreground block">Coverage Provider</span>
            <span class="text-xs font-medium text-foreground block">{{ patient()?.insuranceProvider || 'Self-Pay' }}</span>
          </div>
          <a routerLink="/patient/appointments" hlmBtn variant="default" size="sm" class="gap-2">
            <ng-icon name="lucideCalendarClock" size="15" />
            <span>Book Consultation</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Active Alerts -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="16" class="text-destructive" />
              <h3 class="text-xs font-semibold text-foreground uppercase tracking-wide">Medical Alerts</h3>
            </div>
            <a routerLink="/patient/my-chart" hlmBtn variant="ghost" size="sm" class="h-7 text-[11px] px-2">Details</a>
          </div>
          <div class="p-3 rounded-lg bg-muted/40 border border-border">
            <p class="text-xs text-foreground">{{ patient()?.medicalAlerts || 'No documented critical allergy alerts.' }}</p>
          </div>
        </div>

        <!-- Active Medications -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ng-icon name="lucidePill" size="16" class="text-foreground" />
              <h3 class="text-xs font-semibold text-foreground uppercase tracking-wide">Active Medications</h3>
            </div>
            <a routerLink="/patient/my-chart" hlmBtn variant="ghost" size="sm" class="h-7 text-[11px] px-2">View All</a>
          </div>
          <div class="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <span class="text-2xl font-semibold text-foreground block">{{ activeRxCount() }}</span>
              <span class="text-[11px] text-muted-foreground">Active Prescriptions</span>
            </div>
            <span hlmBadge variant="secondary" class="text-xs">Rx List</span>
          </div>
        </div>

        <!-- Recent Vitals -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ng-icon name="lucideActivity" size="16" class="text-foreground" />
              <h3 class="text-xs font-semibold text-foreground uppercase tracking-wide">Latest Vitals</h3>
            </div>
            <a routerLink="/patient/my-chart" hlmBtn variant="ghost" size="sm" class="h-7 text-[11px] px-2">Flowsheet</a>
          </div>
          <div *ngIf="latestVitals()" class="p-3 rounded-lg bg-muted/40 border border-border space-y-2 text-xs">
            <div class="flex justify-between items-center border-b border-border pb-1.5">
              <span class="text-muted-foreground">Blood Pressure</span>
              <span class="font-medium font-mono text-foreground">{{ latestVitals()?.bloodPressure }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Heart Rate</span>
              <span class="font-medium font-mono text-foreground">{{ latestVitals()?.heartRate }} bpm</span>
            </div>
          </div>
          <div *ngIf="!latestVitals()" class="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground text-center">
            No recent vitals logged.
          </div>
        </div>
      </div>

      <!-- Patient Portal Nav Grid -->
      <div class="space-y-3 pt-2">
        <h2 class="text-sm font-semibold text-foreground">Portal Workspaces</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/patient/profile" class="p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <ng-icon name="lucideUserRound" size="18" class="text-primary" />
              <div>
                <span class="text-xs font-semibold text-primary block">My Health Profile</span>
                <span class="text-[11px] text-muted-foreground block">Habits, allergies & info</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-primary" />
          </a>

          <a routerLink="/patient/my-chart" class="p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <ng-icon name="lucideHeartPulse" size="18" class="text-muted-foreground group-hover:text-foreground" />
              <div>
                <span class="text-xs font-semibold text-foreground block">My Patient Chart</span>
                <span class="text-[11px] text-muted-foreground block">Demographics & records</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground" />
          </a>

          <a routerLink="/patient/appointments" class="p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <ng-icon name="lucideCalendarClock" size="18" class="text-muted-foreground group-hover:text-foreground" />
              <div>
                <span class="text-xs font-semibold text-foreground block">Appointments</span>
                <span class="text-[11px] text-muted-foreground block">Schedule & booking</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PatientDashboardComponent implements OnInit {
  patient = signal<Patient | null>(null);
  activeRxCount = signal(0);
  latestVitals = signal<Vitals | null>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    const u = this.currentUser;
    if (u) {
      this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
        this.patient.set(p);
        if (p) {
          this.apiService.getPrescriptionsByPatient(p.id).subscribe((rx) => this.activeRxCount.set(rx.length));
          this.apiService.getVitalsByPatient(p.id).subscribe((v) => {
            if (v.length > 0) this.latestVitals.set(v[v.length - 1]);
          });
        }
      });
    }
  }
}
