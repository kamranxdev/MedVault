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
    return this.authService.hasRole('ROLE_ADMIN');
  }
  isAuditor(): boolean {
    return this.authService.hasRole('ROLE_AUDITOR');
  }
  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

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
            {
              icon: 'lucideLayoutDashboard',
              label: 'Clinician Dashboard',
              routerLink: '/dashboard',
            },
            { icon: 'lucideHeartPulse', label: 'Patient Charts (MPI)', routerLink: '/patients' },
            { icon: 'lucideFileText', label: 'SOAP Progress Notes', routerLink: '/records' },
            { icon: 'lucideHospital', label: 'Visits & Consultations', routerLink: '/encounters' },
            { icon: 'lucidePill', label: 'Pharmacy & eRx Orders', routerLink: '/prescriptions' },
            { icon: 'lucideListChecks', label: 'Problem List (ICD-10)', routerLink: '/diagnoses' },
            {
              icon: 'lucideTriangleAlert',
              label: 'Allergies & Risk Register',
              routerLink: '/allergies',
            },
            { icon: 'lucideActivity', label: 'Bedside Vitals', routerLink: '/vitals' },
            {
              icon: 'lucideCalendarClock',
              label: 'Consultation Schedule',
              routerLink: '/appointments',
            },
            {
              icon: 'lucideShieldCheck',
              label: 'FHIR R4 Explorer',
              routerLink: '/fhir-explorer',
              badge: 'R4 API',
            },
          ],
        },
      ];
    }
    if (this.isNurse()) {
      return [
        {
          label: 'Nurse Station Workspace',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Nursing Station', routerLink: '/dashboard' },
            { icon: 'lucideHeartPulse', label: 'Patient Care Charts', routerLink: '/patients' },
            { icon: 'lucideActivity', label: 'Bedside Vitals Flowsheet', routerLink: '/vitals' },
            {
              icon: 'lucideTriangleAlert',
              label: 'Coded Allergies & ADRs',
              routerLink: '/allergies',
            },
            { icon: 'lucidePill', label: 'Medication Orders (MAR)', routerLink: '/prescriptions' },
            { icon: 'lucideHospital', label: 'Patient Intake & Visits', routerLink: '/encounters' },
            {
              icon: 'lucideCalendarClock',
              label: 'Unit Ward Schedule',
              routerLink: '/appointments',
            },
            {
              icon: 'lucideShieldCheck',
              label: 'FHIR R4 Explorer',
              routerLink: '/fhir-explorer',
              badge: 'R4 API',
            },
          ],
        },
      ];
    }
    if (this.isAdmin()) {
      return [
        {
          label: 'Hospital Admin & Intake',
          items: [
            { icon: 'lucideLayoutDashboard', label: 'Command Center', routerLink: '/dashboard' },
            {
              icon: 'lucideHeartPulse',
              label: 'Master Patient Index (MPI)',
              routerLink: '/patients',
            },
            {
              icon: 'lucideHospital',
              label: 'Intake Visits & Admissions',
              routerLink: '/encounters',
            },
            {
              icon: 'lucideCalendarClock',
              label: 'Appointment Scheduling',
              routerLink: '/appointments',
            },
          ],
        },
        {
          label: 'System Administration',
          items: [
            { icon: 'lucideSettings', label: 'User RBAC Management', routerLink: '/admin' },
            {
              icon: 'lucideShieldCheck',
              label: 'HIPAA Compliance Vault',
              routerLink: '/audit-ledger',
            },
            {
              icon: 'lucideHeartPulse',
              label: 'FHIR R4 Interop Explorer',
              routerLink: '/fhir-explorer',
              badge: 'R4 API',
            },
          ],
        },
      ];
    }
    if (this.isAuditor()) {
      return [
        {
          label: 'Audit & Forensics Vault',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Compliance Overview',
              routerLink: '/dashboard',
            },
            {
              icon: 'lucideShieldCheck',
              label: 'HIPAA WORM Audit Vault',
              routerLink: '/audit-ledger',
            },
            {
              icon: 'lucideHeartPulse',
              label: 'Patient Access Audit Logs',
              routerLink: '/patients',
            },
            {
              icon: 'lucideShieldCheck',
              label: 'FHIR R4 Interop Explorer',
              routerLink: '/fhir-explorer',
              badge: 'R4 API',
            },
          ],
        },
      ];
    }
    return [
      {
        label: 'My Personal Health Record',
        items: [
          { icon: 'lucideLayoutDashboard', label: 'My Health Summary', routerLink: '/dashboard' },
          { icon: 'lucideUserRound', label: 'My Health Profile', routerLink: '/profile' },
          { icon: 'lucideHeartPulse', label: 'My Patient Chart', routerLink: '/patients' },
          { icon: 'lucidePill', label: 'My Prescriptions', routerLink: '/prescriptions' },
          { icon: 'lucideActivity', label: 'My Vitals Trends', routerLink: '/vitals' },
          { icon: 'lucideTriangleAlert', label: 'My Allergies', routerLink: '/allergies' },
          { icon: 'lucideListChecks', label: 'My Problem List', routerLink: '/diagnoses' },
          { icon: 'lucideFileText', label: 'My Progress Notes', routerLink: '/records' },
          { icon: 'lucideHospital', label: 'My Visit History', routerLink: '/encounters' },
          { icon: 'lucideCalendarClock', label: 'My Appointments', routerLink: '/appointments' },
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
