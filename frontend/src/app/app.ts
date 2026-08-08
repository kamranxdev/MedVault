import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
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
  lucideChevronRight,
  lucideMicroscope,
  lucideReceipt,
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
      lucideChevronRight,
      lucideMicroscope,
      lucideReceipt,
    }),
  ],
  templateUrl: './app.component.html',
})
export class App implements OnInit, OnDestroy {
  isMobile = signal(false);
  sidebarOpen = signal(true);
  isStandalonePage = signal(false);
  currentUrl = signal<string>('/dashboard');

  showDashboardLayout = computed(() => {
    return this.authService.isLoggedIn() && !this.isStandalonePage();
  });

  currentRouteInfo = computed(() => {
    const url = this.currentUrl().split('?')[0];
    switch (url) {
      case '/dashboard':
        return { title: 'Dashboard Command Center', icon: 'lucideLayoutDashboard' };
      case '/receptionist/dashboard':
        return { title: 'Front Desk & Patient Intake Hub', icon: 'lucideCalendarClock' };
      case '/labtech/dashboard':
        return { title: 'Laboratory & Pathology Center', icon: 'lucideMicroscope' };
      case '/pharmacist/dashboard':
        return { title: 'Clinical Pharmacy Center', icon: 'lucidePill' };
      case '/billing/dashboard':
        return { title: 'Revenue Cycle & Billing Operations', icon: 'lucideReceipt' };
      case '/patients':
        return { title: 'Master Patient Index (MPI)', icon: 'lucideHeartPulse' };
      case '/profile':
        return { title: 'My Health Profile & Settings', icon: 'lucideUserRound' };
      case '/encounters':
        return { title: 'Visits & Consultations', icon: 'lucideHospital' };
      case '/allergies':
        return { title: 'Allergies & Risk Register', icon: 'lucideTriangleAlert' };
      case '/diagnoses':
        return { title: 'Problem List (ICD-10)', icon: 'lucideListChecks' };
      case '/records':
        return { title: 'SOAP Progress Notes', icon: 'lucideFileText' };
      case '/vitals':
        return { title: 'Bedside Vitals Flowsheet', icon: 'lucideActivity' };
      case '/prescriptions':
        return { title: 'Pharmacy & eRx Orders', icon: 'lucidePill' };
      case '/appointments':
        return { title: 'Consultation Schedule', icon: 'lucideCalendarClock' };
      case '/audit-ledger':
        return { title: 'Compliance Audit Ledger', icon: 'lucideShieldCheck' };
      case '/admin':
        return { title: 'System Administration', icon: 'lucideSettings' };
      case '/fhir-explorer':
        return { title: 'FHIR R4 API Explorer', icon: 'lucideShieldCheck' };
      default:
        return { title: 'EHR Workspace', icon: 'lucideLayoutDashboard' };
    }
  });

  private mql?: MediaQueryList;
  private mqlListener?: (e: MediaQueryListEvent) => void;
  private routerSub?: any;

  constructor(
    public authService: AuthService,
    public patientContext: PatientContextService,
    public theme: ThemeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.updateStandaloneStatus();
      });

    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.patientContext.loadContext();
      } else {
        this.patientContext.clear();
      }
    });
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.updateStandaloneStatus();

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
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateStandaloneStatus(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const isStandalone = !!route.snapshot.data['standalone'];
    this.isStandalonePage.set(isStandalone);
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

  isDoctor(): boolean {
    return this.authService.hasRole('ROLE_DOCTOR');
  }
  isNurse(): boolean {
    return this.authService.hasRole('ROLE_NURSE');
  }
  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_SYS_ADMIN') || this.authService.hasRole('ROLE_ORG_ADMIN') || this.authService.hasRole('ROLE_ADMIN');
  }
  isReceptionist(): boolean {
    return this.authService.hasRole('ROLE_RECEPTIONIST');
  }
  isLabTech(): boolean {
    return this.authService.hasRole('ROLE_LAB_TECH');
  }
  isPharmacist(): boolean {
    return this.authService.hasRole('ROLE_PHARMACIST');
  }
  isBilling(): boolean {
    return this.authService.hasRole('ROLE_BILLING');
  }
  isAuditor(): boolean {
    return this.authService.hasRole('ROLE_AUDITOR');
  }
  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  primaryRole(): string {
    const roles = this.authService.currentUser()?.roles || [];
    if (roles.includes('ROLE_SYS_ADMIN')) return 'System Admin';
    if (roles.includes('ROLE_ORG_ADMIN')) return 'Org Admin';
    if (roles.includes('ROLE_ADMIN')) return 'Admin / Executive';
    if (roles.includes('ROLE_DOCTOR')) return 'Physician / Clinician';
    if (roles.includes('ROLE_NURSE')) return 'Clinical Nurse';
    if (roles.includes('ROLE_RECEPTIONIST')) return 'Front Desk Receptionist';
    if (roles.includes('ROLE_LAB_TECH')) return 'Laboratory Specialist';
    if (roles.includes('ROLE_PHARMACIST')) return 'Clinical Pharmacist';
    if (roles.includes('ROLE_BILLING')) return 'Billing Officer';
    if (roles.includes('ROLE_AUDITOR')) return 'Compliance Auditor';
    return 'Patient Portal';
  }

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  navGroups = computed<NavGroup[]>(() => {
    if (this.isDoctor()) {
      return [
        {
          label: 'Physician Desk Workspace',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Clinician Dashboard', routerLink: '/doctor/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Patient Charts (MPI)', routerLink: '/doctor/patients' },
            { icon: 'lucideHospital', label: 'Visits & Encounters', routerLink: '/doctor/encounters' },
            { icon: 'lucidePill', label: 'Pharmacy & eRx Orders', routerLink: '/doctor/prescriptions' },
            { icon: 'lucideListChecks', label: 'Problem List (ICD-10)', routerLink: '/doctor/diagnoses' },
            { icon: 'lucideTriangleAlert', label: 'Allergies & Risk Register', routerLink: '/doctor/allergies' },
            { icon: 'lucideActivity', label: 'Bedside Vitals', routerLink: '/doctor/vitals' },
            { icon: 'lucideCalendarClock', label: 'Consultation Schedule', routerLink: '/doctor/appointments' },
          ],
        },
      ];
    }
    if (this.isNurse()) {
      return [
        {
          label: 'Nurse Station Workspace',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Nursing Station', routerLink: '/nurse/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Patient Care Charts', routerLink: '/nurse/patients' },
            { icon: 'lucideActivity', label: 'Bedside Vitals Flowsheet', routerLink: '/nurse/vitals' },
            { icon: 'lucideTriangleAlert', label: 'Coded Allergies & ADRs', routerLink: '/nurse/allergies' },
            { icon: 'lucidePill', label: 'Medication Orders (MAR)', routerLink: '/nurse/prescriptions' },
            { icon: 'lucideCalendarClock', label: 'Unit Ward Schedule', routerLink: '/nurse/appointments' },
          ],
        },
      ];
    }
    if (this.isReceptionist()) {
      return [
        {
          label: 'Reception Desk Workspace',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Intake Hub', routerLink: '/receptionist/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Master Patient Index', routerLink: '/admin/patients' },
            { icon: 'lucideCalendarClock', label: 'Appointment Desk', routerLink: '/admin/appointments' },
          ],
        },
      ];
    }
    if (this.isLabTech()) {
      return [
        {
          label: 'Pathology & Lab Workspace',
          items: [
            { icon: 'lucideMicroscope', label: 'Lab Worklist Hub', routerLink: '/labtech/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Patient Directory', routerLink: '/doctor/patients' },
          ],
        },
      ];
    }
    if (this.isPharmacist()) {
      return [
        {
          label: 'Clinical Pharmacy Workspace',
          items: [
            { icon: 'lucidePill', label: 'eRx Verification Desk', routerLink: '/pharmacist/dashboard' },
            { icon: 'lucideTriangleAlert', label: 'RxNorm Safety Engine', routerLink: '/doctor/allergies' },
          ],
        },
      ];
    }
    if (this.isBilling()) {
      return [
        {
          label: 'Revenue Cycle Workspace',
          items: [
            { icon: 'lucideReceipt', label: 'Billing Operations', routerLink: '/billing/dashboard' },
            { icon: 'lucideCalendarClock', label: 'Appointment Invoices', routerLink: '/admin/appointments' },
          ],
        },
      ];
    }
    if (this.isAdmin()) {
      return [
        {
          label: 'Hospital Admin & Intake',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Command Center', routerLink: '/admin/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Master Patient Index (MPI)', routerLink: '/admin/patients' },
            { icon: 'lucideCalendarClock', label: 'Appointment Desk', routerLink: '/admin/appointments' },
          ],
        },
        {
          label: 'System Administration',
          items: [
            { icon: 'lucideSettings', label: 'User RBAC Management', routerLink: '/admin/users' },
            { icon: 'lucideShieldCheck', label: 'HIPAA Compliance Vault', routerLink: '/auditor/ledger' },
          ],
        },
      ];
    }
    if (this.isAuditor()) {
      return [
        {
          label: 'Audit & Forensics Vault',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Compliance Overview', routerLink: '/auditor/dashboard' },
            { icon: 'lucideShieldCheck', label: 'HIPAA WORM Audit Vault', routerLink: '/auditor/ledger' },
          ],
        },
      ];
    }
    return [
      {
        label: 'My Personal Health Record',
        items: [
          { icon: 'lucideLayoutDashboard', label: 'My Health Summary', routerLink: '/patient/dashboard' },
          { icon: 'lucideUserRound', label: 'My Health Profile', routerLink: '/patient/profile' },
          { icon: 'lucidePill', label: 'My Prescriptions', routerLink: '/patient/prescriptions' },
          { icon: 'lucideActivity', label: 'My Vitals Trends', routerLink: '/patient/vitals' },
          { icon: 'lucideTriangleAlert', label: 'My Allergies', routerLink: '/patient/allergies' },
          { icon: 'lucideCalendarClock', label: 'My Appointments', routerLink: '/patient/appointments' },
        ],
      },
    ];
  });

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
