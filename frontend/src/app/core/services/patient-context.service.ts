import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Patient } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PatientContextService {
  activePatient = signal<Patient | null>(null);
  loading = signal<boolean>(false);
  patientList = signal<Patient[]>([]);

  constructor(private apiService: ApiService, private authService: AuthService) {}

  loadContext(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.activePatient.set(null);
      this.patientList.set([]);
      return;
    }

    this.loading.set(true);

    if (this.authService.hasRole('ROLE_PATIENT')) {
      // Patient user: strictly bind to own record via getPatientByUserId
      this.apiService.getPatientByUserId(user.userId).subscribe({
        next: (patient) => {
          this.activePatient.set(patient);
          this.patientList.set([patient]);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patient profile for user', err);
          this.activePatient.set(null);
          this.loading.set(false);
        }
      });
    } else {
      // Clinician / Staff user: load Master Patient Index
      this.apiService.getPatients().subscribe({
        next: (patients) => {
          this.patientList.set(patients);
          const current = this.activePatient();
          // Retain currently selected patient if still in list, else default to first
          if (current) {
            const found = patients.find(p => p.id === current.id);
            if (found) {
              this.activePatient.set(found);
            } else if (patients.length > 0) {
              this.activePatient.set(patients[0]);
            }
          } else if (patients.length > 0) {
            this.activePatient.set(patients[0]);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patient index', err);
          this.loading.set(false);
        }
      });
    }
  }

  setActivePatient(patient: Patient): void {
    this.activePatient.set(patient);
  }

  selectPatientById(id: number): void {
    const found = this.patientList().find(p => p.id === Number(id));
    if (found) {
      this.activePatient.set(found);
    } else {
      this.apiService.getPatientById(id).subscribe(p => this.activePatient.set(p));
    }
  }

  clear(): void {
    this.activePatient.set(null);
    this.patientList.set([]);
  }
}
