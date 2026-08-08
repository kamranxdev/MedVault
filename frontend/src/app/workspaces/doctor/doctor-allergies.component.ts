import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Allergy } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-allergies',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports],
  providers: [provideIcons({ lucideTriangleAlert })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Allergies & Risk Register
            <span hlmBadge variant="outline" class="text-[10px]">Clinician Review</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Coded drug and food allergen safety register.</p>
        </div>
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
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No allergies documented.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorAllergiesComponent implements OnInit {
  allergies = signal<Allergy[]>([]);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) this.loadAllergies(active.id);
    });
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active) this.loadAllergies(active.id);
  }

  loadAllergies(patientId: number): void {
    this.apiService.getAllergiesByPatient(patientId).subscribe((res) => this.allergies.set(res));
  }
}
