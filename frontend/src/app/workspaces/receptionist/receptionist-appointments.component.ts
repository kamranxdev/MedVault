import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCheckCircle2,
  lucideClock,
  lucideUserCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideCheckCircle2,
      lucideClock,
      lucideUserCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Front Desk Appointment Schedule
            <span hlmBadge variant="secondary" class="text-[11px]">Receptionist</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage patient check-ins, arrival timestamps, and clinician scheduling.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Scheduled Time</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Assigned Physician</th>
                <th hlmTableHead class="text-xs font-semibold">Consultation Reason</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let apt of appointments()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-muted-foreground">{{ apt.appointmentDate | date:'shortTime' }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ apt.patient.fullName || 'Patient Profile' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">Dr. {{ apt.doctor.fullName || 'Assigned Staff' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ apt.reason || 'General Consult' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="apt.status === 'SCHEDULED' ? 'outline' : 'secondary'" class="text-[10px]">
                    {{ apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs gap-1.5 text-primary hover:text-primary/90" (click)="checkIn(apt)">
                    <ng-icon name="lucideUserCheck" size="14" />
                    <span>Check In</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getAppointments().subscribe((apts) => this.appointments.set(apts));
  }

  checkIn(apt: Appointment): void {
    if (!apt.id) return;
    apt.status = 'IN_PROGRESS';
    this.apiService.updateAppointmentStatus(apt.id, 'IN_PROGRESS').subscribe();
  }
}
