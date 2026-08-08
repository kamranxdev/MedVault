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
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus, lucideSave, lucideArrowLeft } from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-intake',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserPlus,
      lucideSave,
      lucideArrowLeft,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <a routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Patient Demographic Intake & Registration
              <span hlmBadge variant="secondary" class="text-[11px]">Intake Desk</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Register new patient MRN identities and insurance coverage.</p>
          </div>
        </div>
      </div>

      <div hlmCard class="p-6 max-w-3xl space-y-6">
        <form (ngSubmit)="savePatient()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Full Name</label>
              <input hlmInput type="text" [(ngModel)]="fullName" name="fullName" placeholder="e.g. Ramesh Kumar" required class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Date of Birth</label>
              <input hlmInput type="date" [(ngModel)]="dob" name="dob" required class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Gender</label>
              <input hlmInput type="text" [(ngModel)]="gender" name="gender" placeholder="Male / Female / Other" class="w-full text-xs" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Phone Number</label>
              <input hlmInput type="text" [(ngModel)]="phone" name="phone" placeholder="+91 98765 43210" class="w-full text-xs" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-foreground">Email Address</label>
              <input hlmInput type="email" [(ngModel)]="email" name="email" placeholder="patient@example.com" class="w-full text-xs" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-foreground">Insurance Carrier & Policy #</label>
              <input hlmInput type="text" [(ngModel)]="insurance" name="insurance" placeholder="Star Health Insurance - Policy #ST-9981" class="w-full text-xs" />
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button hlmBtn variant="default" type="submit" [disabled]="saving()" class="gap-2 text-xs">
              <ng-icon name="lucideSave" size="14" />
              <span>{{ saving() ? 'Saving MRN...' : 'Register Patient' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ReceptionistIntakeComponent implements OnInit {
  fullName = '';
  dob = '';
  gender = 'Male';
  phone = '';
  email = '';
  insurance = '';
  saving = signal(false);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  savePatient(): void {
    if (!this.fullName) return;
    this.saving.set(true);
    this.apiService.createPatient({
      fullName: this.fullName,
      dateOfBirth: this.dob,
      gender: this.gender,
      phone: this.phone,
      email: this.email,
      insuranceProvider: this.insurance,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/receptionist/dashboard']);
      },
      error: () => this.saving.set(false)
    });
  }
}
