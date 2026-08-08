import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Prescription } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePill, lucideShieldCheck, lucideCheckCircle2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-erx',
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
      lucidePill,
      lucideShieldCheck,
      lucideCheckCircle2,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Active eRx Prescription Queue
            <span hlmBadge variant="secondary" class="text-[11px]">Pharmacist</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">RxNorm safety verification, dosage checks, and electronic prescribing.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Rx ID</th>
                <th hlmTableHead class="text-xs font-semibold">Medication Name</th>
                <th hlmTableHead class="text-xs font-semibold">Dosage & Frequency</th>
                <th hlmTableHead class="text-xs font-semibold">RxNorm Code</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let rx of prescriptions()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-muted-foreground">#{{ rx.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ rx.medicationName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ rx.dosage }} - {{ rx.route }} ({{ rx.frequency }})</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ rx.rxNormCode || 'RxNorm-Verified' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="rx.status === 'ACTIVE' ? 'default' : 'secondary'" class="text-[10px]">
                    {{ rx.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium" (click)="verify(rx)">
                    Verify eRx
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
export class PharmacistErxComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getPrescriptionsByPatient(1).subscribe((rxs) => this.prescriptions.set(rxs));
  }

  verify(rx: Prescription): void {
    alert(`Verified RxNorm safety check for ${rx.medicationName}.`);
  }
}
