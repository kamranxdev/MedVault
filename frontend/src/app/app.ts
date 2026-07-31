import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';
import { PatientContextService } from './core/services/patient-context.service';
import { HasRoleDirective, HasAnyRoleDirective } from './core/directives/has-role.directive';

import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface NavItem {
  icon: string;
  label: string;
  routerLink: string;
  badge?: string;
  subItems?: { label: string; routerLink: string }[];
}

interface NavGroup {
  label: string;
  action?: boolean;
  colorClass?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    SidebarModule, 
    AvatarModule, 
    ButtonModule, 
    TagModule,
    HasRoleDirective,
    HasAnyRoleDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit, OnDestroy {
  isMobile = signal(false);
  sidebarOpen = signal(true);

  private mql?: MediaQueryList;
  private mqlListener?: (e: MediaQueryListEvent) => void;

  constructor(
    public authService: AuthService, 
    public patientContext: PatientContextService,
    private router: Router
  ) {
    // Automatically trigger patient context loading whenever user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.patientContext.loadContext();
      } else {
        this.patientContext.clear();
      }
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.mql = window.matchMedia('(max-width: 1023px)');
      this.isMobile.set(this.mql.matches);
      this.sidebarOpen.set(!this.mql.matches);
      this.mqlListener = (e: MediaQueryListEvent) => {
        this.isMobile.set(e.matches);
        this.sidebarOpen.set(!e.matches);
      };
      this.mql.addEventListener('change', this.mqlListener);
    }
  }

  ngOnDestroy(): void {
    if (this.mql && this.mqlListener) {
      this.mql.removeEventListener('change', this.mqlListener);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  onPatientContextChange(patientId: any): void {
    if (patientId) {
      this.patientContext.selectPatientById(Number(patientId));
    }
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

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleBadgeClass(): string {
    const role = this.primaryRole();
    if (role.includes('Admin')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (role.includes('Physician')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (role.includes('Nurse')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    if (role.includes('Auditor')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  }

  navGroups = computed<NavGroup[]>(() => {
    if (this.isDoctor()) {
      return [
        {
          label: 'Physician Desk Workspace',
          colorClass: 'text-emerald-400',
          items: [
            { icon: 'ri-dashboard-3-line', label: 'Clinician Dashboard', routerLink: '/dashboard' },
            { icon: 'ri-user-heart-line', label: 'Patient Charts (MPI)', routerLink: '/patients' },
            { icon: 'ri-file-text-line', label: 'SOAP Progress Notes', routerLink: '/records' },
            { icon: 'ri-hospital-line', label: 'Visits & Consultations', routerLink: '/encounters' },
            { icon: 'ri-capsule-line', label: 'Pharmacy & eRx Orders', routerLink: '/prescriptions' },
            { icon: 'ri-list-check-2', label: 'Problem List (ICD-10)', routerLink: '/diagnoses' },
            { icon: 'ri-alarm-warning-line', label: 'Allergies & Risk Register', routerLink: '/allergies' },
            { icon: 'ri-pulse-line', label: 'Bedside Vitals', routerLink: '/vitals' },
            { icon: 'ri-calendar-schedule-line', label: 'Consultation Schedule', routerLink: '/appointments' }
          ]
        }
      ];
    }
    if (this.isNurse()) {
      return [
        {
          label: 'Nurse Station Workspace',
          colorClass: 'text-amber-400',
          items: [
            { icon: 'ri-dashboard-3-line', label: 'Nursing Station', routerLink: '/dashboard' },
            { icon: 'ri-user-heart-line', label: 'Patient Care Charts', routerLink: '/patients' },
            { icon: 'ri-pulse-line', label: 'Bedside Vitals Flowsheet', routerLink: '/vitals' },
            { icon: 'ri-alarm-warning-line', label: 'Coded Allergies & ADRs', routerLink: '/allergies' },
            { icon: 'ri-capsule-line', label: 'Medication Orders (MAR)', routerLink: '/prescriptions' },
            { icon: 'ri-hospital-line', label: 'Patient Intake & Visits', routerLink: '/encounters' },
            { icon: 'ri-calendar-schedule-line', label: 'Unit Ward Schedule', routerLink: '/appointments' }
          ]
        }
      ];
    }
    if (this.isAdmin()) {
      return [
        {
          label: 'Hospital Admin & Intake',
          colorClass: 'text-blue-400',
          items: [
            { icon: 'ri-dashboard-3-line', label: 'Command Center', routerLink: '/dashboard' },
            { icon: 'ri-user-heart-line', label: 'Master Patient Index (MPI)', routerLink: '/patients' },
            { icon: 'ri-hospital-line', label: 'Intake Visits & Admissions', routerLink: '/encounters' },
            { icon: 'ri-calendar-schedule-line', label: 'Appointment Scheduling', routerLink: '/appointments' }
          ]
        },
        {
          label: 'System Administration',
          colorClass: 'text-slate-400',
          items: [
            { icon: 'ri-settings-3-line', label: 'User RBAC Management', routerLink: '/admin' },
            { icon: 'ri-shield-check-line', label: 'HIPAA Compliance Vault', routerLink: '/audit-ledger' }
          ]
        }
      ];
    }
    if (this.isAuditor()) {
      return [
        {
          label: 'Audit & Forensics Vault',
          colorClass: 'text-purple-400',
          items: [
            { icon: 'ri-dashboard-3-line', label: 'Compliance Overview', routerLink: '/dashboard' },
            { icon: 'ri-shield-check-line', label: 'HIPAA WORM Audit Vault', routerLink: '/audit-ledger' },
            { icon: 'ri-user-heart-line', label: 'Patient Access Audit Logs', routerLink: '/patients' }
          ]
        }
      ];
    }
    return [
      {
        label: 'My Personal Health Record',
        colorClass: 'text-teal-400',
        items: [
          { icon: 'ri-dashboard-3-line', label: 'My Health Summary', routerLink: '/dashboard' },
          { icon: 'ri-user-heart-line', label: 'My Patient Chart', routerLink: '/patients' },
          { icon: 'ri-capsule-line', label: 'My Prescriptions', routerLink: '/prescriptions' },
          { icon: 'ri-pulse-line', label: 'My Vitals Trends', routerLink: '/vitals' },
          { icon: 'ri-alarm-warning-line', label: 'My Allergies', routerLink: '/allergies' },
          { icon: 'ri-list-check-2', label: 'My Problem List', routerLink: '/diagnoses' },
          { icon: 'ri-file-text-line', label: 'My Progress Notes', routerLink: '/records' },
          { icon: 'ri-hospital-line', label: 'My Visit History', routerLink: '/encounters' },
          { icon: 'ri-calendar-schedule-line', label: 'My Appointments', routerLink: '/appointments' }
        ]
      }
    ];
  });

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


