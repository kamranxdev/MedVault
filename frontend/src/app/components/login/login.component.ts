import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLogIn,
  lucideLoader2,
  lucideAlertCircle,
  lucideHeartPulse,
  lucideShieldCheck,
  lucideHome,
  lucideKeyRound
} from '@ng-icons/lucide';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIcon
  ],
  providers: [
    provideIcons({
      lucideLogIn,
      lucideLoader2,
      lucideAlertCircle,
      lucideHeartPulse,
      lucideShieldCheck,
      lucideHome,
      lucideKeyRound
    })
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private patientContext: PatientContextService,
    private router: Router
  ) {}

  fillDemoCredentials(u: string, p: string): void {
    this.username = u;
    this.password = p;
    this.onLogin();
  }

  onLogin(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.patientContext.loadContext();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.errorMessage.set('Cannot connect to backend server. Please verify Spring Boot server is running on http://localhost:8080.');
        } else if (typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else {
          this.errorMessage.set('Invalid username or password.');
        }
      }
    });
  }
}
