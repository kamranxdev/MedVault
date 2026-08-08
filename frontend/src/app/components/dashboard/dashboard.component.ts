import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideLoader2 })],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
      <ng-icon name="lucideLoader2" size="24" class="animate-spin text-primary" />
      <span class="text-xs font-medium tracking-wide">Navigating to your workspace...</span>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_SYS_ADMIN') || this.authService.hasRole('ROLE_ORG_ADMIN') || this.authService.hasRole('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.hasRole('ROLE_DOCTOR')) {
      this.router.navigate(['/doctor/dashboard']);
    } else if (this.authService.hasRole('ROLE_NURSE')) {
      this.router.navigate(['/nurse/dashboard']);
    } else if (this.authService.hasRole('ROLE_RECEPTIONIST')) {
      this.router.navigate(['/receptionist/dashboard']);
    } else if (this.authService.hasRole('ROLE_LAB_TECH')) {
      this.router.navigate(['/labtech/dashboard']);
    } else if (this.authService.hasRole('ROLE_PHARMACIST')) {
      this.router.navigate(['/pharmacist/dashboard']);
    } else if (this.authService.hasRole('ROLE_BILLING')) {
      this.router.navigate(['/billing/dashboard']);
    } else if (this.authService.hasRole('ROLE_AUDITOR')) {
      this.router.navigate(['/auditor/dashboard']);
    } else if (this.authService.hasRole('ROLE_PATIENT')) {
      this.router.navigate(['/patient/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
