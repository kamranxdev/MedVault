import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserPlus,
  lucideLoader2,
  lucideAlertCircle,
  lucideHeartPulse,
  lucideShieldCheck,
  lucideHome,
  lucideCheckCircle2,
  lucideArrowRight,
  lucideLock,
  lucideMail,
  lucideUser,
  lucideKeyRound,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserPlus,
      lucideLoader2,
      lucideAlertCircle,
      lucideHeartPulse,
      lucideShieldCheck,
      lucideHome,
      lucideCheckCircle2,
      lucideArrowRight,
      lucideLock,
      lucideMail,
      lucideUser,
      lucideKeyRound,
    }),
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  registeredPatientId = signal<number | null>(null);

  constructor(
    private authService: AuthService,
    private patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  isFormValid(): boolean {
    return (
      !!this.fullName &&
      !!this.email &&
      !!this.username &&
      !!this.password &&
      this.password === this.confirmPassword &&
      this.password.length >= 6
    );
  }

  getPasswordStrength(): { text: string; color: string; percentage: number } {
    if (!this.password) return { text: 'None', color: 'bg-muted', percentage: 0 };
    if (this.password.length < 6) return { text: 'Weak', color: 'bg-rose-500', percentage: 33 };
    const hasNum = /\d/.test(this.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    if (this.password.length >= 8 && hasNum && hasSpecial) {
      return { text: 'Strong', color: 'bg-emerald-500', percentage: 100 };
    }
    return { text: 'Moderate', color: 'bg-amber-500', percentage: 66 };
  }

  onRegister(): void {
    if (!this.isFormValid() || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      fullName: this.fullName,
      email: this.email,
      username: this.username,
      password: this.password,
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.successMessage.set(
          `Account created successfully! Auto-authenticating and initiating your patient onboarding...`,
        );
        toast.success('Patient Registration Successful', {
          description: 'Auto-authenticating into your health profile workspace...',
        });

        // Automatically log in newly registered patient
        this.authService.login({ username: this.username, password: this.password }).subscribe({
          next: () => {
            this.loading.set(false);
            this.patientContext.loadContext();
            setTimeout(() => {
              this.router.navigate(['/patient/profile']);
            }, 1200);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.status === 0
          ? 'Cannot connect to backend server. Please verify Spring Boot server is running.'
          : (err.error?.message || (typeof err.error === 'string' ? err.error : 'Registration failed. Please check your details and try again.'));
        this.errorMessage.set(msg);
        toast.error('Registration Failed', { description: msg });
      },
    });
  }
}
