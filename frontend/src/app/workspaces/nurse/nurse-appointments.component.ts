import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Appointment } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCalendarClock } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-appointments',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideActivity, lucideCalendarClock })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Unit Triage Schedule
            <span hlmBadge variant="secondary" class="text-[10px]">Nurse Triage</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Pre-consultation triage vitals intake and patient preparation schedule.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left">Reason for Visit</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ apt.appointmentDate | date:'shortTime' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ apt.patient.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ apt.reason }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ apt.status }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button hlmBtn variant="outline" size="sm" class="h-8 text-xs gap-1">
                    <ng-icon name="lucideActivity" size="14" /> Perform Triage Vitals
                  </button>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active triage appointments.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class NurseAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAppointments().subscribe((res) => this.appointments.set(res));
  }
}
