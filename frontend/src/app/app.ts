import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';
import { PatientContextService } from './core/services/patient-context.service';

import { SidebarModule } from 'primeng/sidebar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarModule, DrawerModule, ButtonModule, TagModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit {
  mobileSidebarVisible = signal(false);

  constructor(
    public authService: AuthService, 
    public patientContext: PatientContextService,
    private router: Router
  ) {}

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible.set(!this.mobileSidebarVisible());
  }

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.patientContext.loadContext();
    }
  }

  onPatientContextChange(patientId: string | number): void {
    this.patientContext.selectPatientById(Number(patientId));
  }

  isDoctor(): boolean { return this.authService.hasRole('ROLE_DOCTOR'); }
  isNurse(): boolean { return this.authService.hasRole('ROLE_NURSE'); }
  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
  isAuditor(): boolean { return this.authService.hasRole('ROLE_AUDITOR'); }
  isPatient(): boolean { return this.authService.hasRole('ROLE_PATIENT'); }

  primaryRole(): string {
    const roles = this.authService.currentUser()?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'Admin / Reception';
    if (roles.includes('ROLE_DOCTOR')) return 'Physician / Clinician';
    if (roles.includes('ROLE_NURSE')) return 'Clinical Nurse';
    if (roles.includes('ROLE_AUDITOR')) return 'Compliance Auditor';
    return 'Patient Portal';
  }

  getRoleBadgeClass(): string {
    const role = this.primaryRole();
    if (role.includes('Admin')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (role.includes('Physician')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (role.includes('Nurse')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    if (role.includes('Auditor')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  }

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
