import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideUsers,
  lucideHeartPulse,
  lucideShieldCheck,
  lucideSparkles,
  lucideChevronRight,
  lucideActivity,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    ActionButtonComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSettings,
      lucideUsers,
      lucideHeartPulse,
      lucideShieldCheck,
      lucideSparkles,
      lucideChevronRight,
      lucideActivity,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ng-icon name="lucideSettings" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              System Administration Command Center
              <span hlmBadge variant="secondary" class="text-[11px]">System Admin</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">RBAC management, Synthea cohort generation, & HIPAA compliance vault.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
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

      <!-- System Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Active System Users"
          [value]="userCount()"
          subtitle="Staff & Patient Accounts"
          icon="lucideUsers"
          iconBgClass="bg-primary/10 text-primary" />
        <app-stat-card
          title="MPI Patient Census"
          [value]="patientCount()"
          subtitle="FHIR Registered Identities"
          icon="lucideHeartPulse"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Compliance Vault"
          value="HIPAA WORM"
          subtitle="Immutable Access Logs"
          icon="lucideShieldCheck"
          iconBgClass="bg-accent text-foreground" />
      </div>

      <!-- System Workspaces -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a routerLink="/admin" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideSettings" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">User RBAC Management</h3>
            <p class="text-xs text-muted-foreground mt-1">Provision staff accounts & role assignments.</p>
          </div>
        </a>

        <a routerLink="/patients" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideHeartPulse" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Master Patient Index (MPI)</h3>
            <p class="text-xs text-muted-foreground mt-1">Enterprise registry & patient intake MRN.</p>
          </div>
        </a>

        <a routerLink="/audit-ledger" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ng-icon name="lucideShieldCheck" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">HIPAA Audit Vault</h3>
            <p class="text-xs text-muted-foreground mt-1">Compliance ledger & security logs.</p>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  userCount = signal(0);
  patientCount = signal(0);
  generating = signal(false);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe((u) => this.userCount.set(u.length));
    this.apiService.getPatients().subscribe((p) => this.patientCount.set(p.length));
  }

  generateSyntheticCohort(): void {
    this.generating.set(true);
    this.apiService.generateSyntheticCohort(3).subscribe({
      next: () => {
        this.generating.set(false);
        this.apiService.getPatients().subscribe((p) => this.patientCount.set(p.length));
      },
      error: () => this.generating.set(false),
    });
  }
}
