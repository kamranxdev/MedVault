import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, Patient } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucideStethoscope, lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTextareaImports,
  ],
  providers: [provideIcons({ lucideCalendarClock, lucideStethoscope, lucidePlus })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Consultation Schedule & Clinical Notes
            <span hlmBadge variant="outline" class="text-[10px]">Physician Consultation</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage appointment consultations, record SOAP notes, diagnoses, and lab orders.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left">Type / Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left">Clinical Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ apt.appointmentDate | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ apt.patient.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ apt.reason || 'General Consultation' }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ apt.status }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button hlmBtn variant="default" size="sm" (click)="openConsultationModal(apt)" class="h-8 text-xs font-semibold">
                    Start Consultation
                  </button>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No appointments scheduled today.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  activeApt = signal<Appointment | null>(null);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    this.apiService.getAppointments().subscribe((res) => this.appointments.set(res));
  }

  openConsultationModal(apt: Appointment): void {
    this.activeApt.set(apt);
  }
}
