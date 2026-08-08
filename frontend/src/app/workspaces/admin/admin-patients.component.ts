import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch, lucideHeartPulse, lucideSparkles } from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionButtonComponent,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideHeartPulse, lucideSparkles })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Master Patient Index (MPI Directory)
            <span hlmBadge variant="secondary" class="text-[10px]">System Admin</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Enterprise identity registry, patient intake MRN generation, and Synthea cohorts.</p>
        </div>
        <div class="flex items-center gap-2">
          <app-action-button
            variant="outline"
            size="sm"
            [loading]="generating()"
            (action)="generateCohort()"
            customClass="gap-1.5 text-xs">
            <ng-icon name="lucideSparkles" size="14" /> {{ generating() ? 'Generating...' : 'Add Cohort' }}
          </app-action-button>
          <button hlmBtn variant="default" size="sm" (click)="showIntakeModal.set(true)" class="gap-1.5 font-semibold text-xs">
            <ng-icon name="lucidePlus" size="14" /> Intake New Patient
          </button>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search patient registry by name, MRN code, or SSN..."
            class="pl-9 h-10 w-full text-xs bg-background" />
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Full Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">MRN Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">DOB / Gender</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Type</th>
                <th hlmTableHead class="py-3 px-4 text-left">Insurance Provider</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let p of filteredPatients()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ p.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono"><span hlmBadge variant="outline">{{ p.patientCode }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ p.dateOfBirth }} ({{ p.gender }})</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary">{{ p.bloodType }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ p.insuranceProvider || 'Self-Pay' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminPatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  filteredPatients = signal<Patient[]>([]);
  searchQuery = '';
  showIntakeModal = signal(false);
  generating = signal(false);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe((p) => {
      this.patients.set(p);
      this.filteredPatients.set(p);
    });
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPatients.set(this.patients());
      return;
    }
    this.apiService.searchPatients(this.searchQuery).subscribe((p) => this.filteredPatients.set(p));
  }

  generateCohort(): void {
    this.generating.set(true);
    this.apiService.generateSyntheticCohort(3).subscribe({
      next: () => {
        this.generating.set(false);
        this.loadPatients();
      },
      error: () => this.generating.set(false),
    });
  }
}
