import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, Patient, User } from '../../core/models/models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Scheduled Appointments & Consultations' : 'Appointments & Provider Scheduling Calendar' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {{ isPatient() ? 'Manage your upcoming physician consultations or request a new appointment slot.' : 'Provider consultation slots, patient visit dispatches, and appointment status tracking.' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            (click)="openScheduleModal()" 
            class="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <span>+</span> {{ isPatient() ? 'Request Consultation' : 'Schedule Appointment' }}
          </button>
        </div>
      </div>

      <!-- Main Appointments List -->
      <div class="space-y-4">
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p class="text-slate-400 text-xs mt-2">Loading consultation schedule...</p>
        </div>

        <div *ngIf="!loading() && appointments().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No upcoming or past scheduled appointments found.</p>
        </div>

        <!-- Appointment Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="!loading()">
          <div *ngFor="let apt of appointments()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-3xs font-extrabold text-teal-400 uppercase tracking-wider block mb-1">
                  📅 {{ apt.appointmentDate | date:'fullDate' }} &bull; {{ apt.appointmentDate | date:'shortTime' }}
                </span>
                <h3 class="text-base font-bold text-white">{{ apt.reason }}</h3>
              </div>

              <span [class]="getStatusBadge(apt.status)" class="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider">
                {{ apt.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
                <p class="font-bold text-white mt-0.5">{{ apt.patient.fullName }} ({{ apt.patient.patientCode }})</p>
              </div>

              <div>
                <span class="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Physician</span>
                <p class="font-bold text-indigo-400 mt-0.5">{{ apt.doctor.fullName || 'Dr. Sarah Jenkins' }}</p>
              </div>
            </div>

            <div *ngIf="apt.notes" class="p-3 bg-slate-800/60 rounded-2xl text-slate-300 text-xs border border-slate-800">
              <span class="font-bold text-white">Notes:</span> {{ apt.notes }}
            </div>

            <!-- Status Action Bar for Staff -->
            <div *ngIf="!isPatient() && authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE'])" class="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button 
                *ngIf="apt.status === 'SCHEDULED' && apt.id" 
                (click)="updateStatus(apt.id!, 'CONFIRMED')" 
                class="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-3xs font-bold transition">
                Confirm
              </button>
              <button 
                *ngIf="(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && apt.id" 
                (click)="updateStatus(apt.id!, 'COMPLETED')" 
                class="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-3xs font-bold transition">
                Complete
              </button>
              <button 
                *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.id" 
                (click)="updateStatus(apt.id!, 'CANCELLED')" 
                class="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-3xs font-bold transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-teal-400">
              {{ isPatient() ? 'Request Physician Consultation' : 'Schedule Patient Appointment' }}
            </h3>
            <button (click)="showModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <form (ngSubmit)="saveAppointment()" class="space-y-3 text-xs">
            <!-- Select Patient (Staff Only) -->
            <div *ngIf="!isPatient()">
              <label class="block font-semibold text-slate-400 mb-1">Patient *</label>
              <select [(ngModel)]="newApt.patientId" name="patientId" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                <option [value]="0">Select Patient Profile...</option>
                <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
                  {{ p.fullName }} (MRN: {{ p.patientCode }})
                </option>
              </select>
            </div>

            <!-- Select Doctor -->
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Attending Physician / Specialist *</label>
              <select [(ngModel)]="newApt.doctorId" name="doctorId" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                <option [value]="0">Select Physician...</option>
                <option *ngFor="let d of doctors()" [value]="d.id">
                  {{ d.fullName }} ({{ d.specialization || d.department || 'Staff Physician' }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Appointment Date & Time *</label>
              <input type="datetime-local" [(ngModel)]="newApt.appointmentDate" name="appointmentDate" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Reason for Visit / Chief Complaint *</label>
              <input type="text" [(ngModel)]="newApt.reason" name="reason" placeholder="e.g. Routine 3-Month Diabetes & Cardiology Checkup" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Additional Notes</label>
              <textarea [(ngModel)]="newApt.notes" name="notes" rows="2" placeholder="Patient prefers morning slot..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
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
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'CANCELLED': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      default: return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
  }
}
