import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, Patient, User } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, ButtonModule, InputTextModule, TagModule, CardModule, ToolbarModule, ProgressSpinnerModule, SelectModule, DatePickerModule, TextareaModule],
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

  updateStatus(id: number, status: string): void {
    this.apiService.updateAppointmentStatus(id, status).subscribe(() => {
      if (this.isPatient()) {
        this.loadAppointments(this.currentPatientId);
      } else {
        this.loadAllAppointments();
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'CONFIRMED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'COMPLETED': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      case 'CANCELLED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }
}
