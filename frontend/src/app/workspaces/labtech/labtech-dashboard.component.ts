import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTestTube,
  lucideFileSpreadsheet,
  lucideCheckCheck,
  lucideFlaskConical,
  lucideMicroscope,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-labtech-dashboard',
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
      lucideTestTube,
      lucideFileSpreadsheet,
      lucideCheckCheck,
      lucideFlaskConical,
      lucideMicroscope,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Lab Tech Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucideMicroscope" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Clinical Laboratory & Pathology Center
              <span hlmBadge variant="secondary" class="text-[11px]">Lab Technician</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Specimen processing, diagnostic orders, and pathology report verification.</p>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Pending Specimen Queue"
          [value]="specimenQueueCount()"
          subtitle="Awaiting Processing"
          icon="lucideTestTube"
          iconBgClass="bg-teal-500/10 text-teal-600" />
        <app-stat-card
          title="Verified Reports"
          [value]="verifiedCount()"
          subtitle="LOINC Coded Diagnostic Data"
          icon="lucideCheckCheck"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Lab Analyzer Status"
          value="ONLINE"
          subtitle="Pathology Station #2"
          icon="lucideFlaskConical"
          iconBgClass="bg-purple-500/10 text-purple-600" />
      </div>

      <!-- Lab Worklist Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-foreground">Diagnostic Test Worklist</h2>
            <p class="text-xs text-muted-foreground">Process incoming lab orders and input diagnostic test results.</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Test Description</th>
                <th hlmTableHead class="text-xs font-semibold">LOINC Code</th>
                <th hlmTableHead class="text-xs font-semibold">Priority</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Result Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let sample of labSamples()" hlmTableRow>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ sample.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ sample.testName }}</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ sample.loinc }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="sample.priority === 'STAT' ? 'destructive' : 'secondary'" class="text-[10px]">
                    {{ sample.priority }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-teal-600 hover:text-teal-700" (click)="enterResult(sample)">
                    Enter Result
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
export class LabTechDashboardComponent implements OnInit {
  specimenQueueCount = signal(4);
  verifiedCount = signal(18);

  labSamples = signal([
    { patientName: 'Kamran Khan', testName: 'HbA1c Glycated Hemoglobin', loinc: '4548-4', priority: 'ROUTINE' },
    { patientName: 'Aarav Patel', testName: 'Comprehensive Metabolic Panel (CMP)', loinc: '24323-8', priority: 'STAT' },
    { patientName: 'Ananya Sharma', testName: 'Complete Blood Count (CBC)', loinc: '57021-8', priority: 'URGENT' },
    { patientName: 'Rohan Mehta', testName: 'Lipid Panel', loinc: '24331-1', priority: 'ROUTINE' },
  ]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}

  enterResult(sample: any): void {
    alert(`Opened result entry sheet for ${sample.patientName} (${sample.testName}).`);
  }
}
