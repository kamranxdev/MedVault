import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideCalendarClock, lucideLoader2 } from '@ng-icons/lucide';
import { Appointment, Patient, User } from '../../core/models/models';

@Component({
  selector: 'app-appointments',
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
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon
  ],
  providers: [
    provideIcons({ lucidePlus, lucideCalendarClock, lucideLoader2 })
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  doctors = signal<User[]>([]);
  loading = signal(false);
  showModal = signal(false);

  newApt = {
    patientId: 0,
    doctorId: 0,
    appointmentDate: '',
    reason: '',
    notes: ''
  };

  currentPatientId = 0;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {}

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  ngOnInit(): void {
    this.apiService.getDoctors().subscribe(d => this.doctors.set(d));

    if (this.isPatient()) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          if (p) {
            this.currentPatientId = p.id;
            this.newApt.patientId = p.id;
            this.loadAppointments(p.id);
          }
        });
      }
    } else {
      this.loadAllAppointments();
    }
  }

  loadAppointments(patientId: number): void {
    this.loading.set(true);
    this.apiService.getAppointmentsByPatient(patientId).subscribe({
      next: (apts) => {
        this.appointments.set(apts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadAllAppointments(): void {
    this.loading.set(true);
    this.apiService.getAppointments().subscribe({
      next: (apts) => {
        this.appointments.set(apts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openScheduleModal(): void {
    if (this.isPatient()) {
      this.newApt.patientId = this.currentPatientId;
    } else {
      const active = this.patientContext.activePatient();
      if (active) this.newApt.patientId = active.id;
    }
    if (this.doctors().length > 0) {
      this.newApt.doctorId = this.doctors()[0].id;
    }
    this.showModal.set(true);
  }

  saveAppointment(): void {
    if (!this.newApt.patientId || !this.newApt.doctorId || !this.newApt.reason || !this.newApt.appointmentDate) return;

    this.apiService.scheduleAppointment({
      patient: { id: Number(this.newApt.patientId) } as Patient,
      doctor: { id: Number(this.newApt.doctorId) } as User,
      appointmentDate: this.newApt.appointmentDate as any,
      reason: this.newApt.reason,
      notes: this.newApt.notes,
      status: 'SCHEDULED'
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.newApt = { patientId: 0, doctorId: 0, appointmentDate: '', reason: '', notes: '' };
        if (this.isPatient()) {
          this.loadAppointments(this.currentPatientId);
        } else {
          this.loadAllAppointments();
        }
      }
    });
  }

  updateStatus(id: number | undefined, status: string): void {
    if (!id) return;
    this.apiService.updateAppointmentStatus(id, status).subscribe(() => {
      if (this.isPatient()) {
        this.loadAppointments(this.currentPatientId);
      } else {
        this.loadAllAppointments();
      }
    });
  }
}
