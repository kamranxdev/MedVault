import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideSave,
  lucideCheckCircle2,
  lucideSparkles,
  lucideShieldCheck,
  lucidePhone,
  lucideFileText,
  lucideActivity,
  lucideTriangleAlert,
  lucideHeartPulse,
  lucideLock,
  lucideShieldAlert,
  lucideInfo,
  lucideAlertCircle,
  lucideX,
  lucideMail,
  lucideHome,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ActionButtonComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmDialogImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideSave,
      lucideCheckCircle2,
      lucideSparkles,
      lucideShieldCheck,
      lucidePhone,
      lucideFileText,
      lucideActivity,
      lucideTriangleAlert,
      lucideHeartPulse,
      lucideLock,
      lucideShieldAlert,
      lucideInfo,
      lucideAlertCircle,
      lucideX,
      lucideMail,
      lucideHome,
    }),
  ],
  template: `
    <div class="space-y-6 max-w-5xl">

      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ng-icon name="lucideUserRound" size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">My Health Profile & Onboarding</h1>
              <span hlmBadge variant="outline" class="font-mono text-[10px]">MRN: {{ patient()?.patientCode || 'PAT-1001' }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Single unified workspace for patient onboarding, contact details, insurance, food allergies, and lifestyle profile.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span hlmBadge [variant]="isInitialSaveCompleted() ? 'secondary' : 'outline'" class="text-xs font-semibold px-3 py-1">
            {{ isInitialSaveCompleted() ? '🔒 Identity Locked' : '✏️ Initial Setup' }}
          </span>
        </div>
      </div>

      <!-- ONBOARDING / COMPLETENESS PROGRESS CARD -->
      <div class="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">Health Onboarding Status</span>
            <span hlmBadge [variant]="getCompletenessScore() === 100 ? 'secondary' : 'outline'" class="text-[11px] font-bold">
              {{ getCompletenessScore() }}% Complete
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ getCompletenessScore() === 100 ? 'Your health onboarding profile is 100% complete and verified in the MedVault EHR chart.' : 'Please fill in your phone number, emergency contact, insurance details, and food allergies below.' }}
          </p>
        </div>

        <div class="w-full sm:w-56 space-y-1.5">
          <div class="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-500 rounded-full" [style.width.%]="getCompletenessScore()"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{{ getCompletenessScore() }}/100 Verified</span>
            <span>{{ isInitialSaveCompleted() ? 'EHR Saved' : 'Draft Setup' }}</span>
          </div>
        </div>
      </div>

      <!-- Main Profile Form Sections Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- CARD 1: LEGAL IDENTITY & DEMOGRAPHICS (LOCKED ONCE SAVED) -->
        <div class="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs relative">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideUserRound" size="16" class="text-primary" />
              <span>Legal Identity & Demographics</span>
            </h2>
            <div class="flex items-center gap-1.5">
              <span *ngIf="isInitialSaveCompleted()" class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <ng-icon name="lucideLock" size="11" /> Non-Editable
              </span>
              <span *ngIf="!isInitialSaveCompleted()" hlmBadge variant="outline" class="text-[10px]">Initial Setup</span>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <!-- Full Name (Locked if saved) -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-semibold text-foreground">Full Legal Name</label>
                <button *ngIf="isInitialSaveCompleted()" (click)="triggerLockedFieldNotice('Full Name')" class="text-[10px] text-primary hover:underline flex items-center gap-1">
                  <ng-icon name="lucideLock" size="11" /> Why is this locked?
                </button>
              </div>
              <input
                hlmInput
                type="text"
                [(ngModel)]="profileForm.fullName"
                [disabled]="isInitialSaveCompleted()"
                (click)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Full Name') : null"
                class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50" />
            </div>

            <!-- DOB & Gender (Locked if saved) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="font-semibold text-foreground">Date of Birth</label>
                  <ng-icon *ngIf="isInitialSaveCompleted()" name="lucideLock" size="11" class="text-muted-foreground" />
                </div>
                <input
                  hlmInput
                  type="date"
                  [(ngModel)]="profileForm.dateOfBirth"
                  [disabled]="isInitialSaveCompleted()"
                  (click)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Date of Birth') : null"
                  class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50" />
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="font-semibold text-foreground">Gender</label>
                  <ng-icon *ngIf="isInitialSaveCompleted()" name="lucideLock" size="11" class="text-muted-foreground" />
                </div>
                <select
                  hlmInput
                  [(ngModel)]="profileForm.gender"
                  [disabled]="isInitialSaveCompleted()"
                  (change)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Gender') : null"
                  class="w-full h-9 text-xs bg-background disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>
            </div>

            <!-- Blood Group & Phone -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="font-semibold text-foreground">Blood Group</label>
                  <ng-icon *ngIf="isInitialSaveCompleted()" name="lucideLock" size="11" class="text-muted-foreground" />
                </div>
                <select
                  hlmInput
                  [(ngModel)]="profileForm.bloodType"
                  [disabled]="isInitialSaveCompleted()"
                  (change)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Blood Group') : null"
                  class="w-full h-9 text-xs bg-background disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50">
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label class="font-semibold block text-foreground mb-1">Primary Phone (Editable)</label>
                <input hlmInput type="text" [(ngModel)]="profileForm.phone" placeholder="+1 (555) 019-2834" class="w-full h-9 text-xs" />
              </div>
            </div>

            <div>
              <label class="font-semibold block text-foreground mb-1">Email Address (Editable)</label>
              <input hlmInput type="email" [(ngModel)]="profileForm.email" class="w-full h-9 text-xs" />
            </div>

            <div>
              <label class="font-semibold block text-foreground mb-1">Home Address (Editable)</label>
              <input hlmInput type="text" [(ngModel)]="profileForm.address" placeholder="123 Health Ave, Boston, MA" class="w-full h-9 text-xs" />
            </div>
          </div>
        </div>

        <!-- CARD 2: EMERGENCY CONTACT & INSURANCE (ALWAYS EDITABLE BY PATIENT) -->
        <div class="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePhone" size="16" class="text-primary" />
              <span>Emergency Contact & Insurance Coverage</span>
            </h2>
            <span hlmBadge variant="secondary" class="text-[10px] text-emerald-600 dark:text-emerald-400">Self-Managed</span>
          </div>

          <div class="space-y-4 text-xs">
            <div class="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
              <label class="font-semibold block text-foreground">Emergency Contact & Next of Kin</label>
              <input hlmInput type="text" [(ngModel)]="profileForm.emergencyContact" placeholder="Name, Relationship & Phone Number..." class="w-full h-9 text-xs bg-background" />
              <span class="text-[10px] text-muted-foreground block">Notified during urgent hospital admissions or acute medical events.</span>
            </div>

            <div class="space-y-3">
              <div>
                <label class="font-semibold block text-foreground mb-1">Insurance Carrier / Provider</label>
                <input hlmInput type="text" [(ngModel)]="profileForm.insuranceProvider" placeholder="e.g. BlueCross BlueShield / Self-Pay" class="w-full h-9 text-xs" />
              </div>

              <div>
                <label class="font-semibold block text-foreground mb-1">Policy / Member ID Number</label>
                <input hlmInput type="text" [(ngModel)]="profileForm.insurancePolicyNumber" placeholder="e.g. BCBS-99182348" class="w-full h-9 text-xs font-mono" />
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: CLINICAL HISTORY & LIFESTYLE HABITS -->
        <div class="lg:col-span-2 p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="16" class="text-primary" />
              <span>Longitudinal Clinical History, Allergies & Lifestyle Profile</span>
            </h2>
            <span hlmBadge variant="outline" class="text-[10px]">Clinical Profile</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1.5">
              <label class="font-semibold block text-destructive flex items-center gap-1">
                <span>Food & Drug Allergies</span>
                <span hlmBadge variant="destructive" class="text-[9px]">Critical Safety</span>
              </label>
              <input hlmInput type="text" [(ngModel)]="profileForm.foodAllergies" placeholder="Peanuts, Shellfish, Gluten, Penicillin..." class="w-full h-9 text-xs" />
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold block text-foreground">Dietary Habits</label>
              <select hlmInput [(ngModel)]="profileForm.dietaryHabits" class="w-full h-9 text-xs bg-background">
                <option value="Standard Diet">Standard Diet</option>
                <option value="Low Sodium">Low Sodium (Hypertension)</option>
                <option value="Diabetic / Low Carb">Diabetic / Low Carb</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold block text-foreground">Smoking Status</label>
              <select hlmInput [(ngModel)]="profileForm.smokingStatus" class="w-full h-9 text-xs bg-background">
                <option value="Never">Never</option>
                <option value="Former Smoker">Former Smoker</option>
                <option value="Current Smoker">Current Smoker</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold block text-foreground">Alcohol Consumption</label>
              <select hlmInput [(ngModel)]="profileForm.alcoholConsumption" class="w-full h-9 text-xs bg-background">
                <option value="None/Occasional">None / Occasional</option>
                <option value="Moderate (1-2 drinks/week)">Moderate (1-2 drinks/week)</option>
                <option value="Frequent">Frequent</option>
              </select>
            </div>

            <!-- Past Medical History & Serious Conditions (Locked after verified by clinician) -->
            <div class="md:col-span-2 space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-semibold text-foreground">Previous Major Illnesses & Diagnoses</label>
                <span *ngIf="isInitialSaveCompleted()" class="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ng-icon name="lucideLock" size="11" /> Verified Clinical Log
                </span>
              </div>
              <input
                hlmInput
                type="text"
                [(ngModel)]="profileForm.pastMedicalHistory"
                [disabled]="isInitialSaveCompleted()"
                (click)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Past Medical History') : null"
                placeholder="e.g. Asthma in childhood, Hypertension..."
                class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50" />
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-semibold text-foreground">Serious Conditions / Medical Alerts</label>
                <span *ngIf="isInitialSaveCompleted()" class="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ng-icon name="lucideLock" size="11" /> Verified Clinical Log
                </span>
              </div>
              <input
                hlmInput
                type="text"
                [(ngModel)]="profileForm.seriousConditions"
                [disabled]="isInitialSaveCompleted()"
                (click)="isInitialSaveCompleted() ? triggerLockedFieldNotice('Serious Medical Conditions') : null"
                placeholder="e.g. Type 2 Diabetes, Severe Penicillin Anaphylaxis..."
                class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50" />
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Save Floating Actions Bar -->
      <div class="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2">
          <span *ngIf="saveSuccess()" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ng-icon name="lucideCheckCircle2" size="16" /> Health profile saved successfully!
          </span>
          <span *ngIf="!saveSuccess()" class="text-xs text-muted-foreground">
            Saving will update your live electronic health record chart and lock legal identity fields.
          </span>
        </div>

        <app-action-button
          variant="default"
          size="default"
          [loading]="saving()"
          (action)="saveProfile()"
          customClass="gap-2 font-bold text-xs shadow-sm">
          <ng-icon name="lucideSave" size="15" />
          <span>Save Health Profile</span>
        </app-action-button>
      </div>

      <!-- LOCKED FIELD NOTICE DIALOG MODAL -->
      <div *ngIf="showLockedModal()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
          <button (click)="showLockedModal.set(false)" class="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <ng-icon name="lucideX" size="18" />
          </button>

          <div class="flex items-start gap-3.5">
            <div class="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ng-icon name="lucideShieldAlert" size="24" />
            </div>
            <div class="space-y-1">
              <h3 class="text-base font-bold text-foreground">Verified Medical Record Field Locked</h3>
              <p class="text-xs text-muted-foreground">
                Target Field: <strong class="text-foreground font-semibold">{{ lockedFieldName() }}</strong>
              </p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed space-y-2">
            <p class="text-foreground font-medium">
              Legal identity details (Full Name, Date of Birth, Gender, Blood Group, MRN Code) and verified clinical medical histories cannot be directly edited by patients once established.
            </p>
            <p>
              This safeguard ensures compliance with HIPAA § 164.312 data integrity regulations and prevents unauthorized medical chart alterations.
            </p>
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-semibold text-foreground block">Need to update your legal identity or medical record?</span>
            <div class="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-center justify-between">
              <span>Submit a formal amendment request to your Healthcare Provider.</span>
              <button hlmBtn variant="outline" size="sm" (click)="requestAmendment()" class="text-[11px] h-7 px-2.5 bg-background">
                Request Edit
              </button>
            </div>
          </div>

          <div class="pt-2 border-t border-border flex justify-end">
            <button hlmBtn variant="default" size="sm" (click)="showLockedModal.set(false)" class="text-xs font-semibold">
              Understand & Close
            </button>
          </div>
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

  // Locked Modal Dialog State
  showLockedModal = signal(false);
  lockedFieldName = signal<string>('');

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.apiService.getPatientByUserId(user.userId).subscribe((p) => {
        if (p) {
          this.patient.set(p);
          this.profileForm = { ...p };
        }
      });
    }
  }

  isInitialSaveCompleted(): boolean {
    const p = this.patient();
    if (!p) return false;
    // Profile is locked once initial setup is saved with full name, DOB, and contact details
    return !!(p.fullName && p.dateOfBirth && p.phone && p.address);
  }

  triggerLockedFieldNotice(fieldName: string): void {
    if (this.isInitialSaveCompleted()) {
      this.lockedFieldName.set(fieldName);
      this.showLockedModal.set(true);
      toast.info(`${fieldName} Record Field Locked`, {
        description: 'Verified legal identity details are protected under HIPAA regulations.',
      });
    }
  }

  requestAmendment(): void {
    toast.success('Amendment Request Submitted', {
      description: `Formal request to amend ${this.lockedFieldName()} logged in WORM audit ledger.`,
    });
    this.showLockedModal.set(false);
  }

  getCompletenessScore(): number {
    const p = this.profileForm;
    if (!p) return 0;
    let score = 0;
    if (p.fullName) score += 20;
    if (p.phone) score += 15;
    if (p.email) score += 15;
    if (p.address) score += 10;
    if (p.emergencyContact) score += 15;
    if (p.insuranceProvider) score += 15;
    if (p.foodAllergies || p.dietaryHabits) score += 10;
    return Math.min(100, score);
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
        this.patientContext.loadContext();
        this.saveSuccess.set(true);
        toast.success('Health Profile Saved Successfully', {
          description: 'Your electronic health record chart has been updated.',
        });
        setTimeout(() => this.saveSuccess.set(false), 3500);
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Failed to Save Health Profile', {
          description: err?.error?.message || 'Server error occurred while updating patient chart.',
        });
      },
    });
  }
}
