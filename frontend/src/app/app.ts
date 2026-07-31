import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideHeartPulse,
  lucideFileText,
  lucideHospital,
  lucidePill,
  lucideListChecks,
  lucideTriangleAlert,
  lucideActivity,
  lucideCalendarClock,
  lucideSettings,
  lucideShieldCheck,
  lucideUserRound,
  lucideLogOut,
  lucideMenu,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucideSun,
  lucideMoon,
} from '@ng-icons/lucide';

import { AuthService } from './core/services/auth.service';
import { PatientContextService } from './core/services/patient-context.service';
import { ThemeService } from './core/services/theme.service';

import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

interface NavItem {
  icon: string;
  label: string;
  routerLink: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface PatientOption {
  id: number;
  fullName: string;
  patientCode: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmTooltipImports,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideHeartPulse,
      lucideFileText,
      lucideHospital,
      lucidePill,
      lucideListChecks,
      lucideTriangleAlert,
      lucideActivity,
      lucideCalendarClock,
      lucideSettings,
      lucideShieldCheck,
      lucideUserRound,
      lucideLogOut,
      lucideMenu,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
      lucideSun,
      lucideMoon,
    }),
  ],
  templateUrl: './app.component.html',
})
export class App implements OnInit, OnDestroy {
  isMobile = signal(false);
  sidebarOpen = signal(true);

  private mql?: MediaQueryList;
  private mqlListener?: (e: MediaQueryListEvent) => void;

  constructor(
    public authService: AuthService,
    public patientContext: PatientContextService,
    public theme: ThemeService,
    private router: Router,
  ) {
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
    if (typeof window === 'undefined') return;

    this.mql = window.matchMedia('(max-width: 1023px)');
    this.isMobile.set(this.mql.matches);
    this.sidebarOpen.set(!this.mql.matches);
    this.mqlListener = (e: MediaQueryListEvent) => {
      this.isMobile.set(e.matches);
      this.sidebarOpen.set(!e.matches);
    };
    this.mql.addEventListener('change', this.mqlListener);
  }

  ngOnDestroy(): void {
    if (this.mql && this.mqlListener) {
      this.mql.removeEventListener('change', this.mqlListener);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    if (this.isMobile()) this.sidebarOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  onPatientContextChange(patientId: number | string | undefined): void {
    if (patientId !== undefined && patientId !== null) {
      this.patientContext.selectPatientById(Number(patientId));
    }
  }

  patientItemToString = (id: number): string => {
    const patient = this.patientContext.patientList().find((p: PatientOption) => p.id === id);
    return patient ? `${patient.fullName} (MRN: ${patient.patientCode})` : '';
  };

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
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  navGroups = computed<NavGroup[]>(() => {
    if (this.isDoctor()) {
      return [{
        label: 'Physician Desk Workspace',
        items: [
          { icon: 'lucideLayoutDashboard', label: 'Clinician Dashboard', routerLink: '/dashboard' },
          { icon: 'lucideHeartPulse', label: 'Patient Charts (MPI)', routerLink: '/patients' },
          { icon: 'lucideFileText', label: 'SOAP Progress Notes', routerLink: '/records' },
          { icon: 'lucideHospital', label: 'Visits & Consultations', routerLink: '/encounters' },
          { icon: 'lucidePill', label: 'Pharmacy & eRx Orders', routerLink: '/prescriptions' },
          { icon: 'lucideListChecks', label: 'Problem List (ICD-10)', routerLink: '/diagnoses' },
          { icon: 'lucideTriangleAlert', label: 'Allergies & Risk Register', routerLink: '/allergies' },
          { icon: 'lucideActivity', label: 'Bedside Vitals', routerLink: '/vitals' },
          { icon: 'lucideCalendarClock', label: 'Consultation Schedule', routerLink: '/appointments' },
        ],
      }];
    }
    if (this.isNurse()) {
      return [{
        label: 'Nurse Station Workspace',
        items: [
          { icon: 'lucideLayoutDashboard', label: 'Nursing Station', routerLink: '/dashboard' },
          { icon: 'lucideHeartPulse', label: 'Patient Care Charts', routerLink: '/patients' },
          { icon: 'lucideActivity', label: 'Bedside Vitals Flowsheet', routerLink: '/vitals' },
          { icon: 'lucideTriangleAlert', label: 'Coded Allergies & ADRs', routerLink: '/allergies' },
          { icon: 'lucidePill', label: 'Medication Orders (MAR)', routerLink: '/prescriptions' },
          { icon: 'lucideHospital', label: 'Patient Intake & Visits', routerLink: '/encounters' },
          { icon: 'lucideCalendarClock', label: 'Unit Ward Schedule', routerLink: '/appointments' },
        ],
      }];
    }
    if (this.isAdmin()) {
      return [
        {
          label: 'Hospital Admin & Intake',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Command Center', routerLink: '/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Master Patient Index (MPI)', routerLink: '/patients' },
            { icon: 'lucideHospital', label: 'Intake Visits & Admissions', routerLink: '/encounters' },
            { icon: 'lucideCalendarClock', label: 'Appointment Scheduling', routerLink: '/appointments' },
          ],
        },
        {
          label: 'System Administration',
          items: [
            { icon: 'lucideSettings', label: 'User RBAC Management', routerLink: '/admin' },
            { icon: 'lucideShieldCheck', label: 'HIPAA Compliance Vault', routerLink: '/audit-ledger' },
          ],
        },
      ];
    }
    if (this.isAuditor()) {
      return [{
        label: 'Audit & Forensics Vault',
        items: [
          { icon: 'lucideLayoutDashboard', label: 'Compliance Overview', routerLink: '/dashboard' },
          { icon: 'lucideShieldCheck', label: 'HIPAA WORM Audit Vault', routerLink: '/audit-ledger' },
          { icon: 'lucideHeartPulse', label: 'Patient Access Audit Logs', routerLink: '/patients' },
        ],
      }];
    }
    return [{
      label: 'My Personal Health Record',
      items: [
        { icon: 'lucideLayoutDashboard', label: 'My Health Summary', routerLink: '/dashboard' },
        { icon: 'lucideHeartPulse', label: 'My Patient Chart', routerLink: '/patients' },
        { icon: 'lucidePill', label: 'My Prescriptions', routerLink: '/prescriptions' },
        { icon: 'lucideActivity', label: 'My Vitals Trends', routerLink: '/vitals' },
        { icon: 'lucideTriangleAlert', label: 'My Allergies', routerLink: '/allergies' },
        { icon: 'lucideListChecks', label: 'My Problem List', routerLink: '/diagnoses' },
        { icon: 'lucideFileText', label: 'My Progress Notes', routerLink: '/records' },
        { icon: 'lucideHospital', label: 'My Visit History', routerLink: '/encounters' },
        { icon: 'lucideCalendarClock', label: 'My Appointments', routerLink: '/appointments' },
      ],
    }];
  });

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}