import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserRound, lucideSave, lucideCheckCircle2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionButtonComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideUserRound, lucideSave, lucideCheckCircle2 })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            My Health Profile & Onboarding
            <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage your contact details, insurance provider, dietary habits, and food allergies.</p>
        </div>
      </div>

      <div class="p-6 rounded-xl border border-border bg-card space-y-4 max-w-2xl">
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-semibold block mb-1">Full Name</label>
            <input hlmInput type="text" [(ngModel)]="profileForm.fullName" class="w-full text-xs" />
          </div>
          <div>
            <label class="font-semibold block mb-1">Phone Number</label>
            <input hlmInput type="text" [(ngModel)]="profileForm.phone" class="w-full text-xs" />
          </div>
          <div>
            <label class="font-semibold block mb-1">Email Address</label>
            <input hlmInput type="email" [(ngModel)]="profileForm.email" class="w-full text-xs" />
          </div>
          <div>
            <label class="font-semibold block mb-1">Insurance Provider</label>
            <input hlmInput type="text" [(ngModel)]="profileForm.insuranceProvider" class="w-full text-xs" />
          </div>
          <div>
            <label class="font-semibold block mb-1">Food Allergies</label>
            <input hlmInput type="text" [(ngModel)]="profileForm.foodAllergies" placeholder="Peanuts, Shellfish, Gluten..." class="w-full text-xs" />
          </div>
          <div>
            <label class="font-semibold block mb-1">Dietary Habits</label>
            <input hlmInput type="text" [(ngModel)]="profileForm.dietaryHabits" placeholder="Low Sodium, Vegetarian..." class="w-full text-xs" />
          </div>
        </div>

        <div class="pt-3 border-t border-border flex items-center gap-3">
          <app-action-button
            variant="default"
            size="sm"
            [loading]="saving()"
            (action)="saveProfile()"
            customClass="gap-1.5 font-bold text-xs">
            <ng-icon name="lucideSave" size="14" /> Save Health Profile
          </app-action-button>
          <span *ngIf="saveSuccess()" class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ng-icon name="lucideCheckCircle2" size="14" /> Profile updated successfully!
          </span>
        </div>
      </div>
    </div>
  `,
})
export class PatientProfileComponent implements OnInit {
  patient = signal<Patient | null>(null);
  profileForm: Partial<Patient> = {};
  saving = signal(false);
  saveSuccess = signal(false);

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.apiService.getPatientByUserId(user.userId).subscribe((p) => {
        this.patient.set(p);
        this.profileForm = { ...p };
      });
    }
  }

  saveProfile(): void {
    const p = this.patient();
    if (!p || !p.id || this.saving()) return;
    this.saving.set(true);
    this.saveSuccess.set(false);

    this.apiService.updatePatient(p.id, this.profileForm).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.patient.set(updated);
        this.profileForm = { ...updated };
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }
}
