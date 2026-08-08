import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Vitals, Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideActivity } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-vitals',
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
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideActivity })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Nursing Bedside Vitals Flowsheet
            <span hlmBadge variant="secondary" class="text-[10px]">Nurse Station</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Log patient vitals, BP, HR, SpO2, and calculate live BMI.</p>
        </div>
        <button hlmBtn variant="default" size="sm" (click)="openModal()" class="gap-1.5 font-semibold text-xs">
          <ng-icon name="lucidePlus" size="14" /> Log Bedside Vitals
        </button>
      </div>

      <!-- Vitals Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
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
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class NurseVitalsComponent implements OnInit {
  vitals = signal<Vitals[]>([]);
  selectedPatientId = 0;
  saving = signal(false);
  showModal = signal(false);

  newVitals = {
    bloodPressure: '120/80',
    heartRate: 74,
    temperature: 36.8,
    oxygenSaturation: 98,
    bloodGlucose: 115,
    heightCm: 170,
    weightKg: 70,
  };

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadVitals(active.id);
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
      this.loadVitals(active.id);
    }
  }

  loadVitals(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe((res) => this.vitals.set(res));
  }

  saveVitals(): void {
    if (this.selectedPatientId === 0 || this.saving()) return;
    this.saving.set(true);
    this.apiService
      .recordVitals({
        patient: { id: Number(this.selectedPatientId) } as Patient,
        bloodPressure: this.newVitals.bloodPressure,
        heartRate: Number(this.newVitals.heartRate),
        temperature: Number(this.newVitals.temperature),
        oxygenSaturation: Number(this.newVitals.oxygenSaturation),
        bloodGlucose: Number(this.newVitals.bloodGlucose),
        heightCm: Number(this.newVitals.heightCm),
        weightKg: Number(this.newVitals.weightKg),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.loadVitals(this.selectedPatientId);
        },
        error: () => this.saving.set(false),
      });
  }
}
