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
import {
  lucidePlus,
  lucideCalendarClock,
  lucideLoader2,
  lucideSparkles,
  lucideShieldCheck,
  lucideStethoscope,
  lucideUserCheck,
  lucideActivity,
  lucideFileText,
  lucideReceipt,
  lucidePrinter,
  lucideXCircle,
  lucideMessageSquare,
  lucideEdit3,
  lucideHistory,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideFlaskConical,
  lucidePill,
  lucideInfo,
  lucideUser,
  lucideClock,
  lucideSearch,
  lucideVideo,
  lucideChevronRight,
  lucideChevronLeft,
  lucideCheck,
} from '@ng-icons/lucide';
import {
  Appointment,
  AppointmentBilling,
  AppointmentCancellation,
  AppointmentLabOrder,
  AppointmentNote,
  DoctorRecommendationDTO,
  Patient,
  User,
  Vitals,
  Diagnosis,
  Prescription,
  SafetyCheckResult,
} from '../../core/models/models';

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
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideCalendarClock,
      lucideLoader2,
      lucideSparkles,
      lucideShieldCheck,
      lucideStethoscope,
      lucideUserCheck,
      lucideActivity,
      lucideFileText,
      lucideReceipt,
      lucidePrinter,
      lucideXCircle,
      lucideMessageSquare,
      lucideEdit3,
      lucideHistory,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideFlaskConical,
      lucidePill,
      lucideInfo,
      lucideUser,
      lucideClock,
      lucideSearch,
      lucideVideo,
      lucideChevronRight,
      lucideChevronLeft,
      lucideCheck,
    }),
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})
export class AppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  doctors = signal<User[]>([]);
  recommendedDoctors = signal<DoctorRecommendationDTO[]>([]);
  loading = signal(false);

  // Modals
  showModal = signal(false);
  showWorkspaceModal = signal(false);
  showCancelModal = signal(false);
  showCancellationDetailModal = signal(false);
  showPrintModal = signal(false);

  // Active appointment context for workspace
  activeAppointment = signal<Appointment | null>(null);
  activeTab = signal<'receptionist' | 'nurse' | 'doctor' | 'billing' | 'notes'>('receptionist');

  // Schedule modal & wizard state
  newApt = {
    patientId: 0,
    doctorId: 0,
    appointmentDate: '',
    reason: '',
    notes: '',
  };

  currentPatientId = 0;

  // --- INTERACTIVE SCHEDULE WIZARD STATE ---
  scheduleStep = signal<number>(1);
  visitType = signal<'IN_PERSON' | 'TELEHEALTH' | 'FOLLOW_UP'>('IN_PERSON');
  allPatients = signal<Patient[]>([]);
  patientSearchQuery = signal<string>('');
  selectedPatient = signal<Patient | null>(null);
  selectedSlot = signal<string | null>(null);
  showDoctorFilterAll = signal<boolean>(false);
  symptomChips = [
    '🫀 Cardiac / BP Review',
    '🫁 Respiratory / Cough',
    '🩸 Diabetes / Metabolic',
    '🦴 Joint / Back Pain',
    '🧠 Headache / Migraine',
    '🩺 Routine Physical',
    '🩹 Rash / Skin Check',
  ];

  // --- RECEPTIONIST INTAKE STATE ---
  receptionistForm = {
    insuranceVerified: true,
    insuranceDetails: 'Star Health Premier Gold • Policy #STAR-9874102',
    reportsUploaded: 'Blood_Test_Report_July2026.pdf, ECG_Graph_Recent.png',
    note: '',
  };

  // --- NURSE TRIAGE STATE ---
  nurseVitalsForm = {
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.8,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    heightCm: 170,
    weightKg: 70,
    bloodGlucose: 110,
    nursingNotes: 'Patient appears well-hydrated. Vitals stable at pre-consultation intake.',
  };

  // --- DOCTOR CONSULTATION STATE ---
  doctorForm = {
    diagnosisName: 'Essential Hypertension',
    icdCode: 'I10',
    snomedCode: '59621000',
    diagnosisNotes: 'Baseline blood pressure well-controlled.',

    medicationName: 'Lisinopril',
    rxNormCode: '29046',
    dosage: '10 mg',
    frequency: 'Once daily in the morning',
    durationDays: 30,
    instructions: 'Take in morning with water. Monitor BP weekly.',

    labTestName: 'Lipid Profile & Serum Electrolytes',
    labPriority: 'ROUTINE',
    labIndications: 'Routine 6-month cardiovascular panel review.',

    doctorNotes: 'Patient reports no adverse side-effects. Advised diet sodium restriction.',
    followUpDate: '',
  };

  // Safety alert during doctor consultation
  safetyAlert = signal<SafetyCheckResult | null>(null);
  diagnosesList = signal<any[]>([]);
  prescriptionsList = signal<any[]>([]);
  labOrdersList = signal<AppointmentLabOrder[]>([]);

  // --- COLLABORATIVE NOTES STATE ---
  appointmentNotes = signal<AppointmentNote[]>([]);
  newNoteText = '';
  newNoteType = 'GENERAL';
  editingNoteId = signal<number | null>(null);
  editingNoteText = '';

  // History modal view for edits
  selectedNoteHistory = signal<
    { editedBy: string; editedAt: string; previousContent: string }[] | null
  >(null);

  // --- CANCELLATION MODAL STATE ---
  cancelAptTarget = signal<Appointment | null>(null);
  cancellationReason = '';
  cancellationComment = '';
  cancellationError = signal<string | null>(null);
  cancellationDetail = signal<AppointmentCancellation | null>(null);

  // --- BILLING STATE ---
  appointmentBilling = signal<AppointmentBilling | null>(null);
  billingForm = {
    consultationFee: 150.0,
    triageFee: 30.0,
    labFee: 50.0,
    pharmacyFee: 40.0,
    insuranceCoverage: 100.0,
  };

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {}

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  formatLabel(val?: string): string {
    if (!val) return '';
    return val.replace(/_/g, ' ').replace('ROLE_', '');
  }

  isReceptionist(): boolean {
    return this.authService.isReceptionist();
  }

  isNurse(): boolean {
    return this.authService.isNurse();
  }

  isDoctor(): boolean {
    return this.authService.isDoctor();
  }

  getUserRoleLabel(): string {
    return this.authService.getPrimaryRole();
  }

  ngOnInit(): void {
    this.apiService.getDoctors().subscribe((d) => this.doctors.set(d));
    this.apiService.getPatients().subscribe((pts) => this.allPatients.set(pts));

    if (this.isPatient()) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
          if (p) {
            this.currentPatientId = p.id;
            this.newApt.patientId = p.id;
            this.selectedPatient.set(p);
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
      error: () => this.loading.set(false),
    });
  }

  loadAllAppointments(): void {
    this.loading.set(true);
    this.apiService.getAppointments().subscribe({
      next: (apts) => {
        this.appointments.set(apts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openScheduleModal(): void {
    this.scheduleStep.set(1);
    this.selectedSlot.set(null);
    this.patientSearchQuery.set('');
    this.showDoctorFilterAll.set(false);

    if (this.isPatient()) {
      this.newApt.patientId = this.currentPatientId;
    } else {
      const active = this.patientContext.activePatient();
      const list = this.allPatients();
      if (active) {
        this.newApt.patientId = active.id;
        this.selectedPatient.set(active);
        this.patientSearchQuery.set(active.fullName);
      } else if (list.length > 0) {
        this.newApt.patientId = list[0].id;
        this.selectedPatient.set(list[0]);
        this.patientSearchQuery.set(list[0].fullName);
      }
    }

    // Set default tomorrow datetime
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    tmr.setHours(9, 30, 0, 0);
    this.newApt.appointmentDate = tmr.toISOString().slice(0, 16);

    this.showModal.set(true);
    this.fetchDoctorRecommendations();
  }

  get filteredPatientsList(): Patient[] {
    const q = this.patientSearchQuery().toLowerCase().trim();
    const list = this.allPatients();
    if (!q) return list.slice(0, 5);
    return list
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.patientCode.toLowerCase().includes(q) ||
          (p.dateOfBirth && p.dateOfBirth.includes(q)),
      )
      .slice(0, 6);
  }

  selectPatient(p: Patient): void {
    this.selectedPatient.set(p);
    this.newApt.patientId = p.id;
    this.patientSearchQuery.set(p.fullName);
    this.fetchDoctorRecommendations();
  }

  selectSymptomTag(tag: string): void {
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    if (!this.newApt.reason) {
      this.newApt.reason = cleanTag;
    } else if (!this.newApt.reason.includes(cleanTag)) {
      this.newApt.reason += ' • ' + cleanTag;
    }
    this.fetchDoctorRecommendations();
  }

  selectTimeSlot(slotStr: string): void {
    this.selectedSlot.set(slotStr);
    const match = slotStr.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
    let hours = 9;
    let minutes = 30;
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
    let datePart = this.newApt.appointmentDate
      ? this.newApt.appointmentDate.split('T')[0]
      : '';
    if (!datePart) {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      datePart = tmr.toISOString().split('T')[0];
    }
    const hStr = hours < 10 ? '0' + hours : '' + hours;
    const mStr = minutes < 10 ? '0' + minutes : '' + minutes;
    this.newApt.appointmentDate = `${datePart}T${hStr}:${mStr}`;
  }

  onPatientOrReasonChange(): void {
    this.fetchDoctorRecommendations();
  }

  fetchDoctorRecommendations(): void {
    this.apiService
      .getRecommendedDoctors(
        this.newApt.patientId || undefined,
        this.newApt.reason || undefined,
      )
      .subscribe({
        next: (recs) => {
          this.recommendedDoctors.set(recs);
          if (
            recs &&
            recs.length > 0 &&
            (!this.newApt.doctorId || this.newApt.doctorId === 0)
          ) {
            this.newApt.doctorId = recs[0].doctor.id;
          }
        },
      });
  }

  selectRecommendedDoctor(docId: number): void {
    this.newApt.doctorId = docId;
  }

  getTriageLevel(): string {
    const recs = this.recommendedDoctors();
    if (recs && recs.length > 0 && recs[0].triageRiskLevel) {
      return recs[0].triageRiskLevel;
    }
    const r = (this.newApt.reason || '').toUpperCase();
    if (
      r.includes('CHEST PAIN') ||
      r.includes('STROKE') ||
      r.includes('BREATH') ||
      r.includes('ANAPHYLAXIS')
    )
      return 'EMERGENT';
    if (
      r.includes('FEVER') ||
      r.includes('ASTHMA') ||
      r.includes('PAIN') ||
      r.includes('FRACTURE')
    )
      return 'URGENT';
    return 'ROUTINE';
  }

  getTriageSummary(): string {
    const recs = this.recommendedDoctors();
    if (recs && recs.length > 0 && recs[0].triageSummary) {
      return recs[0].triageSummary;
    }
    const level = this.getTriageLevel();
    if (level === 'EMERGENT')
      return 'Critical symptoms flagged in chief complaint. Priority same-day consultation recommended.';
    if (level === 'URGENT')
      return 'Moderate clinical urgency. Early consultation suggested within 24-48 hours.';
    return 'Standard routine consultation. Normal scheduling slots assigned.';
  }

  getSelectedDoctor(): User | undefined {
    return this.doctors().find((d) => d.id === Number(this.newApt.doctorId));
  }

  getTopDoctorRecommendation(): DoctorRecommendationDTO | undefined {
    return (
      this.recommendedDoctors().find(
        (r) => r.doctor.id === Number(this.newApt.doctorId),
      ) || this.recommendedDoctors()[0]
    );
  }

  nextScheduleStep(): void {
    if (this.scheduleStep() === 1) {
      if (!this.newApt.patientId) return;
      if (!this.newApt.reason) {
        this.newApt.reason = 'General Consultation & Health Evaluation';
      }
      this.fetchDoctorRecommendations();
      this.scheduleStep.set(2);
    } else if (this.scheduleStep() === 2) {
      if (!this.newApt.doctorId) return;
      this.scheduleStep.set(3);
    } else if (this.scheduleStep() === 3) {
      if (!this.newApt.appointmentDate) return;
      this.scheduleStep.set(4);
    }
  }

  prevScheduleStep(): void {
    if (this.scheduleStep() > 1) {
      this.scheduleStep.set(this.scheduleStep() - 1);
    }
  }

  saveAppointment(): void {
    if (
      !this.newApt.patientId ||
      !this.newApt.doctorId ||
      !this.newApt.reason ||
      !this.newApt.appointmentDate
    )
      return;

    this.apiService
      .scheduleAppointment({
        patient: { id: Number(this.newApt.patientId) } as Patient,
        doctor: { id: Number(this.newApt.doctorId) } as User,
        appointmentDate: this.newApt.appointmentDate as any,
        reason:
          this.newApt.reason +
          (this.visitType() === 'TELEHEALTH' ? ' (Virtual Telehealth)' : ''),
        notes: this.newApt.notes,
        status: 'SCHEDULED',
        stage: 'SCHEDULED',
      })
      .subscribe({
        next: () => {
          this.showModal.set(false);
          this.newApt = {
            patientId: 0,
            doctorId: 0,
            appointmentDate: '',
            reason: '',
            notes: '',
          };
          this.selectedPatient.set(null);
          this.refreshList();
        },
      });
  }

  refreshList(): void {
    if (this.isPatient()) {
      this.loadAppointments(this.currentPatientId);
    } else {
      this.loadAllAppointments();
    }
  }

  // ==========================================
  // COLLABORATIVE WORKSPACE DRAWER/MODAL
  // ==========================================
  openWorkspace(apt: Appointment): void {
    this.activeAppointment.set(apt);
    this.showWorkspaceModal.set(true);

    // Default tab based on role & stage
    if (this.isReceptionist() && apt.status === 'SCHEDULED') {
      this.activeTab.set('receptionist');
    } else if (this.isNurse() && (apt.status === 'CHECKED_IN' || apt.status === 'SCHEDULED')) {
      this.activeTab.set('nurse');
    } else if (this.isDoctor() && (apt.status === 'TRIAGED' || apt.status === 'IN_CONSULTATION')) {
      this.activeTab.set('doctor');
    } else {
      this.activeTab.set('notes');
    }

    if (apt.id) {
      this.loadWorkspaceData(apt.id);
    }
  }

  loadWorkspaceData(aptId: number): void {
    this.apiService.getAppointmentNotes(aptId).subscribe((n) => this.appointmentNotes.set(n));
    this.apiService.getLabOrders(aptId).subscribe((l) => this.labOrdersList.set(l));
    this.apiService.getBillingDetails(aptId).subscribe((b) => this.appointmentBilling.set(b));
    const apt = this.activeAppointment();
    if (apt && apt.patient && apt.patient.id) {
      this.apiService.getPrescriptionsByPatient(apt.patient.id).subscribe((p) => {
        if (p && p.length > 0) {
          this.prescriptionsList.set(p);
        }
      });
    }
  }

  // --- RECEPTIONIST CHECK-IN SUBMIT ---
  submitReceptionistCheckIn(): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id) return;

    this.apiService
      .checkInPatient(apt.id, {
        insuranceVerified: this.receptionistForm.insuranceVerified,
        insuranceDetails: this.receptionistForm.insuranceDetails,
        reportsUploaded: this.receptionistForm.reportsUploaded,
        note: this.receptionistForm.note,
      })
      .subscribe((updated) => {
        this.activeAppointment.set(updated);
        this.loadWorkspaceData(updated.id!);
        this.refreshList();
        this.receptionistForm.note = '';
      });
  }

  // --- NURSE TRIAGE SUBMIT ---
  submitNurseTriage(): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id) return;

    this.apiService.recordTriageVitals(apt.id, this.nurseVitalsForm).subscribe((updated) => {
      this.activeAppointment.set(updated);
      this.loadWorkspaceData(updated.id!);
      this.refreshList();
    });
  }

  // Calculate live BMI
  get CalculatedBmi(): number {
    if (this.nurseVitalsForm.heightCm > 0 && this.nurseVitalsForm.weightKg > 0) {
      const hm = this.nurseVitalsForm.heightCm / 100;
      return Math.round((this.nurseVitalsForm.weightKg / (hm * hm)) * 10) / 10;
    }
    return 0;
  }

  // --- DOCTOR CONSULTATION HELPERS ---
  addDiagnosisToDraft(): void {
    if (!this.doctorForm.diagnosisName) return;
    const current = this.diagnosesList();
    this.diagnosesList.set([
      ...current,
      {
        conditionName: this.doctorForm.diagnosisName,
        icdCode: this.doctorForm.icdCode,
        snomedCode: this.doctorForm.snomedCode,
        notes: this.doctorForm.diagnosisNotes,
      },
    ]);
    this.doctorForm.diagnosisName = '';
    this.doctorForm.icdCode = '';
  }

  checkDoctorMedSafety(): void {
    const apt = this.activeAppointment();
    if (!apt || !this.doctorForm.medicationName) return;

    this.apiService
      .checkPrescriptionSafety(apt.patient.id, this.doctorForm.medicationName)
      .subscribe((res) => {
        this.safetyAlert.set(res);
      });
  }

  addPrescriptionToDraft(): void {
    if (!this.doctorForm.medicationName) return;
    const current = this.prescriptionsList();
    this.prescriptionsList.set([
      ...current,
      {
        medicationName: this.doctorForm.medicationName,
        rxNormCode: this.doctorForm.rxNormCode,
        dosage: this.doctorForm.dosage,
        frequency: this.doctorForm.frequency,
        durationDays: this.doctorForm.durationDays,
        instructions: this.doctorForm.instructions,
      },
    ]);
    this.doctorForm.medicationName = '';
    this.safetyAlert.set(null);
  }

  addLabOrderToDraft(): void {
    if (!this.doctorForm.labTestName) return;
    const current = this.labOrdersList();
    this.labOrdersList.set([
      ...current,
      {
        testName: this.doctorForm.labTestName,
        priority: this.doctorForm.labPriority,
        clinicalIndications: this.doctorForm.labIndications,
      } as any,
    ]);
    this.doctorForm.labTestName = '';
  }

  submitDoctorConsultation(): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id) return;

    const payload = {
      doctorNotes: this.doctorForm.doctorNotes,
      followUpDate: this.doctorForm.followUpDate,
      diagnoses: this.diagnosesList(),
      prescriptions: this.prescriptionsList(),
      labOrders: this.labOrdersList(),
    };

    this.apiService.recordDoctorConsultation(apt.id, payload).subscribe((updated) => {
      this.activeAppointment.set(updated);
      this.loadWorkspaceData(updated.id!);
      this.refreshList();
    });
  }

  // --- BILLING SUBMIT ---
  submitBilling(): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id) return;

    this.apiService.generateBilling(apt.id, this.billingForm).subscribe((b) => {
      this.appointmentBilling.set(b);
      this.loadWorkspaceData(apt.id!);
      this.refreshList();
    });
  }

  calculateNetPayable(): number {
    const total =
      this.billingForm.consultationFee +
      this.billingForm.triageFee +
      this.billingForm.labFee +
      this.billingForm.pharmacyFee;
    return Math.max(0, total - this.billingForm.insuranceCoverage);
  }

  // --- COLLABORATIVE NOTES ---
  submitNewNote(): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id || !this.newNoteText.trim()) return;

    const noteType = this.isReceptionist()
      ? 'RECEPTIONIST_ADMIN'
      : this.isNurse()
        ? 'NURSE_OBSERVATION'
        : this.isDoctor()
          ? 'DOCTOR_CLINICAL'
          : 'PATIENT_REMARK';

    this.apiService.addAppointmentNote(apt.id, noteType, this.newNoteText).subscribe(() => {
      this.newNoteText = '';
      this.loadWorkspaceData(apt.id!);
    });
  }

  startEditNote(note: AppointmentNote): void {
    if (!note.id) return;
    this.editingNoteId.set(note.id);
    this.editingNoteText = note.content;
  }

  cancelEditNote(): void {
    this.editingNoteId.set(null);
    this.editingNoteText = '';
  }

  saveEditNote(noteId: number): void {
    const apt = this.activeAppointment();
    if (!apt || !apt.id || !this.editingNoteText.trim()) return;

    this.apiService.editAppointmentNote(noteId, this.editingNoteText).subscribe(() => {
      this.editingNoteId.set(null);
      this.editingNoteText = '';
      this.loadWorkspaceData(apt.id!);
    });
  }

  canEditNote(note: AppointmentNote): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return (
      user.userId === note.authorId ||
      user.fullName === note.authorName ||
      this.authService.isAdmin()
    );
  }

  openNoteHistory(note: AppointmentNote): void {
    if (!note.editHistoryJson) return;
    try {
      const history = JSON.parse(note.editHistoryJson);
      this.selectedNoteHistory.set(history);
    } catch {
      this.selectedNoteHistory.set(null);
    }
  }

  closeNoteHistory(): void {
    this.selectedNoteHistory.set(null);
  }

  // ==========================================
  // APPOINTMENT CANCELLATION REASON MODAL
  // ==========================================
  openCancelModal(apt: Appointment): void {
    this.cancelAptTarget.set(apt);
    this.cancellationReason = '';
    this.cancellationComment = '';
    this.cancellationError.set(null);
    this.showCancelModal.set(true);

    // Set default dropdown option based on role
    const reasons = this.getCancellationReasonOptions();
    if (reasons && reasons.length > 0) {
      this.cancellationReason = reasons[0];
    }
  }

  getCancellationReasonOptions(): string[] {
    const role = this.authService.getPrimaryRole();
    if (role === 'Patient') {
      return [
        'Feeling better',
        'Personal emergency',
        'Schedule conflict',
        'Booked by mistake',
        'Financial reason',
        'Going to another doctor',
        'Other',
      ];
    } else if (role === 'Doctor') {
      return [
        'Doctor unavailable',
        'Emergency surgery',
        'Medical emergency',
        'Leave',
        'Hospital emergency',
        'Schedule conflict',
        'Other',
      ];
    } else {
      // Receptionist / Admin
      return [
        'Duplicate booking',
        'Invalid booking',
        'Doctor unavailable',
        'Patient requested cancellation',
        'Payment issue',
        'Administrative reason',
        'Other',
      ];
    }
  }

  isCancellationSubmitDisabled(): boolean {
    if (!this.cancellationReason) return true;
    if (
      this.cancellationReason === 'Other' &&
      (!this.cancellationComment || !this.cancellationComment.trim())
    ) {
      return true;
    }
    return false;
  }

  submitCancellation(): void {
    const apt = this.cancelAptTarget();
    if (!apt || !apt.id) return;

    if (
      this.cancellationReason === 'Other' &&
      (!this.cancellationComment || !this.cancellationComment.trim())
    ) {
      this.cancellationError.set(
        'Additional comments are mandatory when "Other" is selected as the cancellation reason.',
      );
      return;
    }

    this.apiService
      .cancelAppointment(apt.id, this.cancellationReason, this.cancellationComment)
      .subscribe({
        next: () => {
          this.showCancelModal.set(false);
          this.cancelAptTarget.set(null);
          this.cancellationReason = '';
          this.cancellationComment = '';
          this.cancellationError.set(null);
          this.refreshList();
        },
        error: (err) => {
          this.cancellationError.set(err.error?.message || 'Failed to submit cancellation.');
        },
      });
  }

  openCancellationDetailModal(apt: Appointment): void {
    if (!apt.id) return;
    this.apiService.getCancellationDetails(apt.id).subscribe((c) => {
      this.cancellationDetail.set(c);
      this.showCancellationDetailModal.set(true);
    });
  }

  openPrintModal(): void {
    const apt = this.activeAppointment();
    if (apt && apt.patient && apt.patient.id) {
      this.apiService.getPrescriptionsByPatient(apt.patient.id).subscribe((p) => {
        if (p && p.length > 0) {
          this.prescriptionsList.set(p);
        }
      });
    }
    this.showPrintModal.set(true);
  }

  triggerPrint(): void {
    window.print();
  }
}
