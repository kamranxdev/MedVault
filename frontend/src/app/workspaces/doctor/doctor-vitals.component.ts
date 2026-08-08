import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Vitals } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-vitals',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports],
  providers: [provideIcons({ lucideActivity })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Bedside Vitals Flowsheet
            <span hlmBadge variant="outline" class="text-[10px]">Physician Trends</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Blood pressure, heart rate, SpO2, and BMI trend flowsheet.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Recorded Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Pressure</th>
                <th hlmTableHead class="py-3 px-4 text-left">Heart Rate</th>
                <th hlmTableHead class="py-3 px-4 text-left">Temperature</th>
                <th hlmTableHead class="py-3 px-4 text-left">SpO2</th>
                <th hlmTableHead class="py-3 px-4 text-left">BMI</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let v of vitals()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ v.recordedAt | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground font-mono">{{ v.bloodPressure }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.heartRate }} bpm</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.temperature }} °C</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.oxygenSaturation }} %</td>
                <td hlmTableCell class="py-3 px-4 font-mono font-semibold">{{ v.bmi || '23.5' }}</td>
              </tr>
              <tr *ngIf="vitals().length === 0" hlmTableRow>
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals logged.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorVitalsComponent implements OnInit {
  vitals = signal<Vitals[]>([]);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) this.loadVitals(active.id);
    });
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active) this.loadVitals(active.id);
  }

  loadVitals(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe((res) => this.vitals.set(res));
  }
}
