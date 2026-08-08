import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideSave,
  lucideCheckCircle2,
  lucideChevronRight,
  lucideChevronLeft,
  lucideHeartPulse,
  lucideShieldCheck,
  lucidePhone,
  lucideFileText,
  lucideActivity,
  lucideLock,
  lucideHome,
  lucideSparkles,
  lucideCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-onboarding',
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
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideSave,
      lucideCheckCircle2,
      lucideChevronRight,
      lucideChevronLeft,
      lucideHeartPulse,
      lucideShieldCheck,
      lucidePhone,
      lucideFileText,
      lucideActivity,
      lucideLock,
      lucideHome,
      lucideSparkles,
      lucideCheck,
    }),
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent implements OnInit {
  currentStep = signal<number>(1);
  patient = signal<Patient | null>(null);
  saving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);

  // Form State
  profileForm: Partial<Patient> = {
    fullName: '',
    dateOfBirth: '1995-05-15',
    gender: 'Female',
    bloodType: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    foodAllergies: '',
    dietaryHabits: 'Standard Diet',
    smokingStatus: 'Never',
    alcoholConsumption: 'None/Occasional',
    exerciseRoutine: 'Moderate (2-3x / week)',
    pastMedicalHistory: '',
    seriousConditions: '',
    surgeriesAndProcedures: '',
  };

  // Consents State
  hipaaConsent = true;
  telehealthConsent = true;
  digitalRecordConsent = true;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.apiService.getPatientByUserId(user.userId).subscribe({
        next: (p) => {
          if (p) {
            this.patient.set(p);
            this.profileForm = {
              ...this.profileForm,
              ...p,
              fullName: p.fullName || user.fullName,
              email: p.email || user.username + '@example.com',
            };

            // Smart Step Resumption on Refresh
            if (!p.phone || !p.address) {
              this.currentStep.set(1);
            } else if (!p.emergencyContact) {
              this.currentStep.set(2);
            } else if (!p.insuranceProvider) {
              this.currentStep.set(3);
            } else if (!p.foodAllergies && !p.dietaryHabits) {
              this.currentStep.set(4);
            } else {
              this.currentStep.set(5);
            }
          }
        },
        error: () => {
          this.profileForm.fullName = user.fullName;
        },
      });
    }
  }

  nextStep(): void {
    if (this.currentStep() < 5) {
      this.currentStep.set(this.currentStep() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 5) {
      this.currentStep.set(step);
    }
  }

  completeOnboarding(): void {
    const p = this.patient();
    if (!p || !p.id || this.saving()) return;

    this.saving.set(true);

    this.apiService.updatePatient(p.id, this.profileForm).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.patient.set(updated);
        this.patientContext.loadContext();
        this.saveSuccess.set(true);
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Failed to complete onboarding:', err);
      },
    });
  }

  finishAndNavigate(): void {
    if (this.authService.isPatient()) {
      this.router.navigate(['/patient/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
