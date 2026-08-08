import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-appointments',
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
    NgIcon,
  ],
  providers: [provideIcons({ lucideCalendarClock, lucidePlus })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            My Consultation Schedule
            <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Book new appointments and view scheduled clinical consultations.</p>
        </div>
        <button hlmBtn variant="default" size="sm" (click)="showBookingModal.set(true)" class="gap-1.5 font-semibold text-xs">
          <ng-icon name="lucidePlus" size="14" /> Book Consultation
        </button>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Attending Doctor</th>
                <th hlmTableHead class="py-3 px-4 text-left">Consultation Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ apt.appointmentDate | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">Dr. {{ apt.doctor.fullName || 'Assigned Physician' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ apt.reason }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ apt.status }}</span></td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="4" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No upcoming appointments scheduled.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PatientAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  showBookingModal = signal(false);

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.currentUser();
    if (u) {
      this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
        if (p) this.apiService.getAppointmentsByPatient(p.id).subscribe((a) => this.appointments.set(a));
      });
    }
  }
}
