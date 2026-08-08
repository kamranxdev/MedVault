import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Prescription } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePill } from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports],
  providers: [provideIcons({ lucidePill })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            My Prescriptions & Refill List
            <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">View your active medications, dosages, and refill status.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Medication Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">Dosage & Route</th>
                <th hlmTableHead class="py-3 px-4 text-left">Frequency</th>
                <th hlmTableHead class="py-3 px-4 text-left">Instructions</th>
                <th hlmTableHead class="py-3 px-4 text-left">Refills Remaining</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let rx of prescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ rx.medicationName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage }} ({{ rx.route }})</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.frequency }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ rx.instructions }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ rx.refills }} refills</span></td>
              </tr>
              <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active prescriptions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PatientPrescriptionsComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.currentUser();
    if (u) {
      this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
        if (p) this.apiService.getPrescriptionsByPatient(p.id).subscribe((rx) => this.prescriptions.set(rx));
      });
    }
  }
}
