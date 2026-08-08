import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTestTube, lucideFlaskConical, lucideFileText } from '@ng-icons/lucide';

@Component({
  selector: 'app-labtech-worklist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideTestTube,
      lucideFlaskConical,
      lucideFileText,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Laboratory Specimen Queue & Orders
            <span hlmBadge variant="secondary" class="text-[11px]">Lab Technician</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Incoming specimen processing, LOINC test orders, and laboratory worklist.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Specimen ID</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Diagnostic Test</th>
                <th hlmTableHead class="text-xs font-semibold">LOINC Code</th>
                <th hlmTableHead class="text-xs font-semibold">Priority</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Worklist Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let sample of labSamples()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-muted-foreground">{{ sample.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ sample.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ sample.testName }}</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ sample.loinc }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="sample.priority === 'STAT' ? 'destructive' : 'secondary'" class="text-[10px]">
                    {{ sample.priority }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <a routerLink="/labtech/results" class="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                    Process Test
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class LabTechWorklistComponent implements OnInit {
  labSamples = signal([
    { id: 'SPEC-8801', patientName: 'Kamran Khan', testName: 'HbA1c Glycated Hemoglobin', loinc: '4548-4', priority: 'ROUTINE' },
    { id: 'SPEC-8802', patientName: 'Aarav Patel', testName: 'Comprehensive Metabolic Panel (CMP)', loinc: '24323-8', priority: 'STAT' },
    { id: 'SPEC-8803', patientName: 'Ananya Sharma', testName: 'Complete Blood Count (CBC)', loinc: '57021-8', priority: 'URGENT' },
    { id: 'SPEC-8804', patientName: 'Rohan Mehta', testName: 'Lipid Panel', loinc: '24331-1', priority: 'ROUTINE' },
  ]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}
}
