import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCheck, lucideArrowLeft, lucideMicroscope } from '@ng-icons/lucide';

@Component({
  selector: 'app-labtech-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCheckCheck,
      lucideArrowLeft,
      lucideMicroscope,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <a routerLink="/labtech/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              LOINC Diagnostic Result Entry
              <span hlmBadge variant="secondary" class="text-[11px]">Lab Technician</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Input diagnostic findings, reference ranges, and verify lab reports.</p>
          </div>
        </div>
      </div>

      <div hlmCard class="p-6 max-w-3xl space-y-6">
        <form (ngSubmit)="submitResults()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Patient Name</label>
              <input hlmInput type="text" [(ngModel)]="patientName" name="patientName" required class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Test Name & LOINC</label>
              <input hlmInput type="text" [(ngModel)]="testLOINC" name="testLOINC" required class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Observed Value / Result</label>
              <input hlmInput type="text" [(ngModel)]="observedValue" name="observedValue" placeholder="e.g. 5.7 %" required class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Reference Range</label>
              <input hlmInput type="text" [(ngModel)]="referenceRange" name="referenceRange" placeholder="e.g. 4.0 - 5.6 %" class="w-full text-xs" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-foreground">Pathologist Clinical Impression</label>
              <input hlmInput type="text" [(ngModel)]="notes" name="notes" placeholder="Normal glycated hemoglobin level..." class="w-full text-xs" />
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button hlmBtn variant="default" type="submit" [disabled]="submitting()" class="gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white">
              <ng-icon name="lucideCheckCheck" size="14" />
              <span>{{ submitting() ? 'Verifying Result...' : 'Verify & Sign Lab Report' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LabTechResultsComponent implements OnInit {
  patientName = 'Kamran Khan';
  testLOINC = 'HbA1c Glycated Hemoglobin (LOINC 4548-4)';
  observedValue = '5.7 %';
  referenceRange = '4.0 - 5.6 %';
  notes = 'Prediabetes boundary screening.';
  submitting = signal(false);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  submitResults(): void {
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.router.navigate(['/labtech/dashboard']);
    }, 400);
  }
}
