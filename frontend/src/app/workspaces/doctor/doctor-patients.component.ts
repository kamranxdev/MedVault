import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Allergy, Diagnosis, Prescription, Vitals } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideHeartPulse,
  lucideTriangleAlert,
  lucideListChecks,
  lucidePill,
  lucideActivity,
  lucideChevronRight,
  lucidePlus,
  lucideShieldCheck,
  lucideUserRound,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-patients',
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
  providers: [
    provideIcons({
      lucideSearch,
      lucideHeartPulse,
      lucideTriangleAlert,
      lucideListChecks,
      lucidePill,
      lucideActivity,
      lucideChevronRight,
      lucidePlus,
      lucideShieldCheck,
      lucideUserRound,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Patient Charts (MPI)</span>
            <span hlmBadge variant="outline" class="text-xs font-mono font-normal">Physician Desk</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Search, inspect longitudinal EHR charts, review problem lists, and issue eRx orders.
          </p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            (input)="executeSearch()"
            placeholder="Search patients by name, MRN code, or phone number..."
            class="pl-9 h-10 w-full text-xs bg-background" />
        </div>
      </div>

      <!-- MPI Patient Directory -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Demographics</th>
                <th hlmTableHead class="py-3 px-4 text-left">MRN Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">DOB / Gender</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Group</th>
                <th hlmTableHead class="py-3 px-4 text-left">Contact Info</th>
                <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let p of filteredPatients()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ p.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono"><span hlmBadge variant="outline">{{ p.patientCode }}</span></td>
                <td hlmTableCell class="py-3 px-4">{{ p.dateOfBirth }} ({{ p.gender }})</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary">{{ p.bloodType }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ p.phone || 'No phone' }}</td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button hlmBtn variant="default" size="sm" (click)="openChart(p)" class="h-8 text-xs gap-1 font-semibold">
                    Open Chart <ng-icon name="lucideChevronRight" size="14" />
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
export class DoctorPatientsComponent implements OnInit {
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

  openChart(patient: Patient): void {
    this.patientContext.setActivePatient(patient);
  }
}
