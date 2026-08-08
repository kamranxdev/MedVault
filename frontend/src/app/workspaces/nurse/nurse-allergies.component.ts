import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Allergy, Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTriangleAlert } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-allergies',
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
  providers: [provideIcons({ lucidePlus, lucideTriangleAlert })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Coded Allergies & Risk Register
            <span hlmBadge variant="secondary" class="text-[10px]">Nursing Station</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Document allergen safety records, severity, and reaction descriptions.</p>
        </div>
        <button hlmBtn variant="default" size="sm" (click)="showModal.set(true)" class="gap-1.5 font-semibold text-xs">
          <ng-icon name="lucidePlus" size="14" /> Document Allergy
        </button>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Allergen</th>
                <th hlmTableHead class="py-3 px-4 text-left">Category</th>
                <th hlmTableHead class="py-3 px-4 text-left">Severity</th>
                <th hlmTableHead class="py-3 px-4 text-left">Reaction Description</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let a of allergies()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ a.allergenName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.category }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge [variant]="a.severity === 'SEVERE' ? 'destructive' : 'secondary'" class="text-[10px]">{{ a.severity }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.reactionDescription }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px]">{{ a.status }}</span></td>
              </tr>
              <tr *ngIf="allergies().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active allergies documented.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class NurseAllergiesComponent implements OnInit {
  allergies = signal<Allergy[]>([]);
  selectedPatientId = 0;
  saving = signal(false);
  showModal = signal(false);

  newAllergy = {
    allergenName: '',
    category: 'DRUG',
    severity: 'SEVERE',
    reactionDescription: '',
    status: 'ACTIVE',
  };

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadAllergies(active.id);
      }
    });
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active) {
      this.selectedPatientId = active.id;
      this.loadAllergies(active.id);
    }
  }

  loadAllergies(patientId: number): void {
    this.apiService.getAllergiesByPatient(patientId).subscribe((res) => this.allergies.set(res));
  }

  saveAllergy(): void {
    if (this.selectedPatientId === 0 || !this.newAllergy.allergenName || this.saving()) return;
    this.saving.set(true);
    this.apiService
      .createAllergy({
        patient: { id: Number(this.selectedPatientId) } as Patient,
        allergenName: this.newAllergy.allergenName,
        category: this.newAllergy.category,
        severity: this.newAllergy.severity,
        reactionDescription: this.newAllergy.reactionDescription,
        status: this.newAllergy.status,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.loadAllergies(this.selectedPatientId);
        },
        error: () => this.saving.set(false),
      });
  }
}
