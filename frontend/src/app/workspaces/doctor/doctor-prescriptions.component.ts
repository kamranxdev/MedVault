import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Prescription, SafetyCheckResult } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucidePill, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucidePill, lucideAlertCircle })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Pharmacy & eRx Workspace
            <span hlmBadge variant="outline" class="text-[10px]">Physician Prescribing</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Issue eRx orders, check drug interactions, & manage RxNorm codes.</p>
        </div>
        <button hlmBtn variant="default" size="sm" (click)="openModal()" class="gap-1.5 font-semibold text-xs">
          <ng-icon name="lucidePlus" size="14" /> Issue New eRx Order
        </button>
      </div>

      <!-- Prescriptions Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Medication</th>
                <th hlmTableHead class="py-3 px-4 text-left">Dosage & Route</th>
                <th hlmTableHead class="py-3 px-4 text-left">Instructions</th>
                <th hlmTableHead class="py-3 px-4 text-left">Duration / Refills</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let rx of prescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ rx.medicationName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage }} ({{ rx.route }})</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.frequency }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.durationDays }} days / {{ rx.refills }} refills</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ rx.status }}</span></td>
              </tr>
              <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active eRx orders.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorPrescriptionsComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
  selectedPatientId = 0;
  saving = signal(false);
  showModal = signal(false);

  newRx = {
    medicationName: '',
    dosage: '500 mg',
    route: 'Oral',
    frequency: 'Twice Daily',
    durationDays: 30,
    refills: 2,
    instructions: '',
  };

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadRx(active.id);
      }
    });
  }

  openModal(): void {
    this.showModal.set(true);
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active) {
      this.selectedPatientId = active.id;
      this.loadRx(active.id);
    }
  }

  loadRx(patientId: number): void {
    this.apiService.getPrescriptionsByPatient(patientId).subscribe((rx) => this.prescriptions.set(rx));
  }
}
