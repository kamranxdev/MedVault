import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideHospital, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSearch, lucideHospital, lucideChevronRight })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Nursing Unit Patient Census
            <span hlmBadge variant="secondary" class="text-[10px]">Nursing Station</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Active unit patient directory, bedside charts, and intake history.</p>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            (input)="executeSearch()"
            placeholder="Search active patients by name or MRN..."
            class="pl-9 h-10 w-full text-xs bg-background" />
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">MRN Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">DOB / Gender</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Type</th>
                <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let p of filteredPatients()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ p.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono"><span hlmBadge variant="outline">{{ p.patientCode }}</span></td>
                <td hlmTableCell class="py-3 px-4">{{ p.dateOfBirth }} ({{ p.gender }})</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary">{{ p.bloodType }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button hlmBtn variant="secondary" size="sm" (click)="selectPatient(p)" class="h-8 text-xs gap-1 font-medium">
                    Open Bedside Chart <ng-icon name="lucideChevronRight" size="14" />
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
export class NursePatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  filteredPatients = signal<Patient[]>([]);
  searchQuery = '';

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    this.apiService.getPatients().subscribe((data) => {
      this.patients.set(data);
      this.filteredPatients.set(data);
    });
  }

  executeSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPatients.set(this.patients());
      return;
    }
    this.apiService.searchPatients(this.searchQuery).subscribe((data) => this.filteredPatients.set(data));
  }

  selectPatient(patient: Patient): void {
    this.patientContext.setActivePatient(patient);
  }
}
