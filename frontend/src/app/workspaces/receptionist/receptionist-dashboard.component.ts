import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Patient, Appointment } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideUsers,
  lucideUserPlus,
  lucideClipboardCheck,
  lucideClock,
  lucideSearch,
  lucideCheckCircle2,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideUsers,
      lucideUserPlus,
      lucideClipboardCheck,
      lucideClock,
      lucideSearch,
      lucideCheckCircle2,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Receptionist Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucideCalendar" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Front Desk & Patient Intake Hub
              <span hlmBadge variant="secondary" class="text-[11px]">Receptionist</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Demographic registration, appointment check-ins, & intake workflow.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/admin/patients" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
            <ng-icon name="lucideUserPlus" size="14" />
            <span>Register New Patient</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Today's Appointments"
          [value]="appointments().length"
          subtitle="Scheduled Intake Visits"
          icon="lucideCalendar"
          iconBgClass="bg-sky-500/10 text-sky-600" />
        <app-stat-card
          title="Registered Patients"
          [value]="patientCount()"
          subtitle="Master Patient Directory"
          icon="lucideUsers"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Reception Status"
          value="ON DUTY"
          subtitle="Front Desk Station #1"
          icon="lucideClipboardCheck"
          iconBgClass="bg-amber-500/10 text-amber-600" />
      </div>

      <!-- Intake Roster & Check-In Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-foreground">Front Desk Intake Roster</h2>
            <p class="text-xs text-muted-foreground">Manage patient arrivals, check-in verification, and doctor scheduling.</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Assigned Physician</th>
                <th hlmTableHead class="text-xs font-semibold">Visit Reason</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Intake Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let apt of appointments()" hlmTableRow>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ apt.patient.fullName || 'Patient Profile' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">Dr. {{ apt.doctor.fullName || 'Assigned Doctor' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ apt.reason || 'General Consult' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="apt.status === 'SCHEDULED' ? 'outline' : 'secondary'" class="text-[10px]">
                    {{ apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs gap-1.5 text-primary hover:text-primary/90" (click)="checkIn(apt)">
                    <ng-icon name="lucideCheckCircle2" size="14" />
                    <span>Check In</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td hlmTableCell colspan="5" class="text-center text-xs text-muted-foreground py-8">
                  No appointments scheduled for front-desk check-in.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistDashboardComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  patientCount = signal(0);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getAppointments().subscribe((apts) => this.appointments.set(apts));
    this.apiService.getPatients().subscribe((pts) => this.patientCount.set(pts.length));
  }

  checkIn(apt: Appointment): void {
    if (!apt.id) return;
    apt.status = 'IN_PROGRESS';
    this.apiService.updateAppointmentStatus(apt.id, 'IN_PROGRESS').subscribe();
  }
}
