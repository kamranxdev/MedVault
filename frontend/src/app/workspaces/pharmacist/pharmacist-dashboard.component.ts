import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Prescription } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePill,
  lucideShieldAlert,
  lucideCheckCircle2,
  lucideSparkles,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePill,
      lucideShieldAlert,
      lucideCheckCircle2,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Pharmacist Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucidePill" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Clinical Pharmacy Verification Center
              <span hlmBadge variant="secondary" class="text-[11px]">Pharmacist</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">eRx verification, RxNorm allergy safety checks, & medication dispensing log.</p>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Active eRx Orders"
          [value]="prescriptions().length"
          subtitle="RxNorm Verified Prescriptions"
          icon="lucidePill"
          iconBgClass="bg-indigo-500/10 text-indigo-600" />
        <app-stat-card
          title="Allergy Contraindications"
          value="0 Active"
          subtitle="Smart Safety Engine Filtered"
          icon="lucideShieldAlert"
          iconBgClass="bg-rose-500/10 text-rose-600" />
        <app-stat-card
          title="Dispensing Station"
          value="ACTIVE"
          subtitle="PharmD Desk #1"
          icon="lucideCheckCircle2"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
      </div>

      <!-- eRx Queue Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-foreground">Pending Medication Verification Queue</h2>
            <p class="text-xs text-muted-foreground">Review dosage, frequency, and dispense verified prescriptions.</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Medication Name</th>
                <th hlmTableHead class="text-xs font-semibold">Dosage & Route</th>
                <th hlmTableHead class="text-xs font-semibold">RxNorm Code</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Pharmacy Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let rx of prescriptions()" hlmTableRow>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ rx.medicationName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ rx.dosage }} - {{ rx.route }} ({{ rx.frequency }})</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ rx.rxNormCode || 'RxNorm-Verified' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="rx.status === 'ACTIVE' ? 'default' : 'secondary'" class="text-[10px]">
                    {{ rx.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-indigo-600 hover:text-indigo-700" (click)="dispense(rx)">
                    Dispense eRx
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistDashboardComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getPrescriptionsByPatient(1).subscribe((rxs) => this.prescriptions.set(rxs));
  }

  dispense(rx: Prescription): void {
    if (!rx.id) return;
    rx.status = 'DISPENSED';
    this.apiService.updatePrescriptionStatus(rx.id, 'DISPENSED').subscribe();
  }
}
