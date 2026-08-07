import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Allergy,
  Appointment,
  AppointmentBilling,
  AppointmentCancellation,
  AppointmentLabOrder,
  AppointmentNote,
  AuditLog,
  Diagnosis,
  Encounter,
  MedicalRecord,
  Patient,
  Prescription,
  SafetyCheckResult,
  User,
  Vitals,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Patients (Demographics & Identity)
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(
      `${this.baseUrl}/patients/search?query=${encodeURIComponent(query)}`,
    );
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  getPatientClinicalHistory(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/patients/${id}/clinical-history`);
  }

  getPatientByUserId(userId: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/user/${userId}`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/patients/${id}`, patient);
  }

  // Encounters & Visits
  getEncountersByPatient(patientId: number): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.baseUrl}/encounters/patient/${patientId}`);
  }

  createEncounter(encounter: Partial<Encounter>): Observable<Encounter> {
    return this.http.post<Encounter>(`${this.baseUrl}/encounters`, encounter);
  }

  updateEncounter(id: number, encounter: Partial<Encounter>): Observable<Encounter> {
    return this.http.put<Encounter>(`${this.baseUrl}/encounters/${id}`, encounter);
  }

  // Allergies & Contraindications
  getAllergiesByPatient(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${this.baseUrl}/allergies/patient/${patientId}`);
  }

  createAllergy(allergy: Partial<Allergy>): Observable<Allergy> {
    return this.http.post<Allergy>(`${this.baseUrl}/allergies`, allergy);
  }

  updateAllergyStatus(id: number, status: string): Observable<Allergy> {
    return this.http.put<Allergy>(`${this.baseUrl}/allergies/${id}/status?status=${status}`, {});
  }

  // Diagnoses & Problem Lists
  getDiagnosesByPatient(patientId: number): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(`${this.baseUrl}/diagnoses/patient/${patientId}`);
  }

  createDiagnosis(diagnosis: Partial<Diagnosis>): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(`${this.baseUrl}/diagnoses`, diagnosis);
  }

  updateDiagnosisStatus(id: number, status: string): Observable<Diagnosis> {
    return this.http.put<Diagnosis>(`${this.baseUrl}/diagnoses/${id}/status?status=${status}`, {});
  }

  // Medical Records (EHR Legacy Notes)
  getRecordsByPatient(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.baseUrl}/records/patient/${patientId}`);
  }

  createRecord(record: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.baseUrl}/records`, record);
  }

  // Vitals & Observations
  getVitalsByPatient(patientId: number): Observable<Vitals[]> {
    return this.http.get<Vitals[]>(`${this.baseUrl}/vitals/patient/${patientId}`);
  }

  recordVitals(vitals: Partial<Vitals>): Observable<Vitals> {
    return this.http.post<Vitals>(`${this.baseUrl}/vitals`, vitals);
  }

  // Prescriptions & Smart Safety Engine
  getPrescriptionsByPatient(patientId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.baseUrl}/prescriptions/patient/${patientId}`);
  }

  checkPrescriptionSafety(
    patientId: number,
    medicationName: string,
  ): Observable<SafetyCheckResult> {
    return this.http.post<SafetyCheckResult>(`${this.baseUrl}/prescriptions/safety-check`, {
      patientId,
      medicationName,
    });
  }

  validatePrescriptionSafety(
    patientId: number,
    medicationName: string,
    dosage?: string,
    instructions?: string,
  ): Observable<SafetyCheckResult> {
    return this.http.post<SafetyCheckResult>(`${this.baseUrl}/prescriptions/validate-safety`, {
      patientId,
      medicationName,
      dosage,
      instructions,
    });
  }

  createPrescription(
    prescription: Partial<Prescription>,
    overrideWarning = false,
  ): Observable<Prescription> {
    return this.http.post<Prescription>(
      `${this.baseUrl}/prescriptions?overrideWarning=${overrideWarning}`,
      prescription,
    );
  }

  updatePrescriptionStatus(id: number, status: string): Observable<Prescription> {
    return this.http.put<Prescription>(
      `${this.baseUrl}/prescriptions/${id}/status?status=${status}`,
      {},
    );
  }

  // Appointments & Collaborative Workflow
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/patient/${patientId}`);
  }

  getRecommendedDoctors(patientId?: number, reason?: string): Observable<any[]> {
    let query = '';
    const params: string[] = [];
    if (patientId) params.push(`patientId=${patientId}`);
    if (reason) params.push(`reason=${encodeURIComponent(reason)}`);
    if (params.length > 0) query = '?' + params.join('&');
    return this.http.get<any[]>(`${this.baseUrl}/appointments/recommended-doctors${query}`);
  }

  scheduleAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.baseUrl}/appointments/${id}/status?status=${status}`,
      {},
    );
  }

  checkInPatient(
    id: number,
    payload: {
      insuranceVerified?: boolean;
      insuranceDetails?: string;
      reportsUploaded?: string;
      note?: string;
    },
  ): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/${id}/check-in`, payload);
  }

  recordTriageVitals(id: number, payload: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/${id}/triage-vitals`, payload);
  }

  recordDoctorConsultation(id: number, payload: any): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.baseUrl}/appointments/${id}/doctor-consultation`,
      payload,
    );
  }

  getAppointmentNotes(id: number): Observable<AppointmentNote[]> {
    return this.http.get<AppointmentNote[]>(`${this.baseUrl}/appointments/${id}/notes`);
  }

  addAppointmentNote(id: number, noteType: string, content: string): Observable<AppointmentNote> {
    return this.http.post<AppointmentNote>(`${this.baseUrl}/appointments/${id}/notes`, {
      noteType,
      content,
    });
  }

  editAppointmentNote(noteId: number, content: string): Observable<AppointmentNote> {
    return this.http.put<AppointmentNote>(`${this.baseUrl}/appointments/notes/${noteId}`, {
      content,
    });
  }

  cancelAppointment(
    id: number,
    reason: string,
    comment?: string,
  ): Observable<AppointmentCancellation> {
    return this.http.post<AppointmentCancellation>(`${this.baseUrl}/appointments/${id}/cancel`, {
      reason,
      comment,
    });
  }

  getCancellationDetails(id: number): Observable<AppointmentCancellation> {
    return this.http.get<AppointmentCancellation>(
      `${this.baseUrl}/appointments/${id}/cancellation`,
    );
  }

  generateBilling(id: number, payload: any): Observable<AppointmentBilling> {
    return this.http.post<AppointmentBilling>(
      `${this.baseUrl}/appointments/${id}/billing`,
      payload,
    );
  }

  getBillingDetails(id: number): Observable<AppointmentBilling> {
    return this.http.get<AppointmentBilling>(`${this.baseUrl}/appointments/${id}/billing`);
  }

  getLabOrders(id: number): Observable<AppointmentLabOrder[]> {
    return this.http.get<AppointmentLabOrder[]>(`${this.baseUrl}/appointments/${id}/lab-orders`);
  }

  // Synthetic Data Pipeline
  generateSyntheticCohort(count = 3): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/synthetic/generate`, { count });
  }

  getSyntheaPipelineStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/synthetic/pipeline-status`);
  }

  generateSyntheaPipeline(count = 3, state = 'Massachusetts'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/synthetic/generate`, { count, state });
  }

  ingestSyntheaBundle(bundleJson: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/synthetic/ingest-bundle`, bundleJson, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/doctors`);
  }

  // Compliance Audit Ledger
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`);
  }

  getAuditLogs(search?: string): Observable<AuditLog[]> {
    const url = search
      ? `${this.baseUrl}/admin/audit-logs?search=${encodeURIComponent(search)}`
      : `${this.baseUrl}/admin/audit-logs`;
    return this.http.get<AuditLog[]>(url);
  }

  // HL7 FHIR R4 Interoperability Subsystem
  private fhirUrl = 'http://localhost:8080/fhir/v1';

  getFhirMetadata(): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/metadata`);
  }

  getFhirPatients(name?: string, gender?: string, identifier?: string): Observable<any> {
    let query = '';
    const params: string[] = [];
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
    if (identifier) params.push(`identifier=${encodeURIComponent(identifier)}`);
    if (params.length > 0) query = '?' + params.join('&');
    return this.http.get<any>(`${this.fhirUrl}/Patient${query}`);
  }

  getFhirResource(resourceType: string, patientId?: number): Observable<any> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}${query}`);
  }

  getFhirResourceById(resourceType: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}/${id}`);
  }

  getFhirPatientEverything(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/Patient/${patientId}/$everything`);
  }

  createFhirPatient(payload: any): Observable<any> {
    return this.http.post<any>(`${this.fhirUrl}/Patient`, payload);
  }
}
