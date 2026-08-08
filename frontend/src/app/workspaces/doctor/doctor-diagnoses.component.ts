import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Diagnosis, Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideListChecks } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-diagnoses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
  ],
  providers: [provideIcons({ lucidePlus, lucideListChecks })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Problem List & ICD-10 Diagnoses
            <span hlmBadge variant="outline" class="text-[10px]">Physician Coding</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage active medical problems, ICD-10 codes, and SNOMED terms.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Condition Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">ICD-10 Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">Onset Date</th>
                <th hlmTableHead class="py-3 px-4 text-left">Notes</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let d of diagnoses()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ d.conditionName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono"><span hlmBadge variant="outline">{{ d.icdCode }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ d.onsetDate | date:'mediumDate' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ d.notes }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ d.status }}</span></td>
              </tr>
              <tr *ngIf="diagnoses().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active diagnoses logged.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorDiagnosesComponent implements OnInit {
  diagnoses = signal<Diagnosis[]>([]);
  selectedPatientId = 0;

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadDiagnoses(active.id);
      }
    });
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active) {
      this.selectedPatientId = active.id;
      this.loadDiagnoses(active.id);
    }
  }

  loadDiagnoses(patientId: number): void {
    this.apiService.getDiagnosesByPatient(patientId).subscribe((res) => this.diagnoses.set(res));
  }
}
