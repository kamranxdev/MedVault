import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Encounter } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideStethoscope } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-encounters',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports],
  providers: [provideIcons({ lucideStethoscope })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Clinical Encounters & Visits
            <span hlmBadge variant="outline" class="text-[10px]">Physician History</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Longitudinal outpatient visit notes and clinical encounters.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Date</th>
                <th hlmTableHead class="py-3 px-4 text-left">Encounter Class</th>
                <th hlmTableHead class="py-3 px-4 text-left">Reason for Visit</th>
                <th hlmTableHead class="py-3 px-4 text-left">Location</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let enc of encounters()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ enc.encounterDate | date:'shortDate' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ enc.encounterType }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ enc.chiefComplaint || 'Routine Visit' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">Outpatient Clinic</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ enc.status }}</span></td>
              </tr>
              <tr *ngIf="encounters().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No clinical encounters recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorEncountersComponent implements OnInit {
  encounters = signal<Encounter[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Encounters initial state empty or fetched per patient
    this.encounters.set([]);
  }
}
