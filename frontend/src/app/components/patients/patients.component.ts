import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Vitals, Prescription, Encounter, Allergy, Diagnosis, SafetyCheckResult } from '../../core/models/models';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Master Patient Index (MPI) Search & Header Bar -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <i class="ri-user-heart-line text-2xl text-indigo-400"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">Clinical EHR Patient Chart Workspace</h1>
          </div>
          <p class="text-xs text-slate-400">Master Patient Index &bull; FHIR R4 Compliant Enterprise Health Record</p>
        </div>

        <!-- MPI Search & Quick Actions (Clinicians Only) -->
        <div *ngIf="!authService.hasRole('ROLE_PATIENT')" class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div class="relative flex-grow lg:w-80">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="executeMpiSearch()" 
              placeholder="Search MPI by MRN, SSN, Name, Phone..." 
              class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
            <i class="ri-search-line absolute left-3 top-3 text-slate-400 text-xs"></i>
          </div>

          <button 
            *ngIf="authService.hasRole('ROLE_ADMIN')" 
            (click)="showIntakeModal.set(true)" 
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5">
            <span>+</span> Intake New Patient
          </button>
        </div>
      </div>

      <!-- Patient Selection Strip (Clinicians Only) -->
      <div *ngIf="!authService.hasRole('ROLE_PATIENT')" class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        <button 
          *ngFor="let p of filteredPatients()" 
          (click)="selectPatient(p)"
          [class.ring-2]="selectedPatient()?.id === p.id"
          [class.ring-indigo-500]="selectedPatient()?.id === p.id"
          [class.bg-slate-800]="selectedPatient()?.id === p.id"
          [class.bg-slate-900]="selectedPatient()?.id !== p.id"
          class="px-4 py-3 border border-slate-800 rounded-2xl text-left flex items-center gap-3 min-w-[220px] transition hover:bg-slate-800/80">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
            {{ p.fullName.charAt(0) }}
          </div>
          <div class="overflow-hidden">
            <p class="font-bold text-white text-xs truncate">{{ p.fullName }}</p>
            <span class="text-3xs font-mono text-indigo-400 block">{{ p.patientCode }} &bull; {{ p.bloodType }}</span>
          </div>
        </button>
      </div>

      <!-- Main Clinical Chart Area -->
      <div *ngIf="selectedPatient() as p; else noPatientSelected" class="space-y-6">
        
        <!-- Persistent Patient Demographics & Safety Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-black text-2xl flex items-center justify-center shadow-inner">
                {{ p.fullName.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-bold text-white tracking-tight">{{ p.fullName }}</h2>
                  <span class="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-xs font-extrabold">{{ p.bloodType }}</span>
                  <span class="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-xs font-mono font-bold">{{ p.patientCode }}</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">
                  DOB: <strong class="text-slate-200">{{ p.dateOfBirth }}</strong> &bull; Gender: <strong class="text-slate-200">{{ p.gender }}</strong> &bull; SSN: <strong class="text-slate-200 font-mono">{{ p.ssn || 'XXX-XX-XXXX' }}</strong>
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs">
              <div class="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
                <span class="text-slate-400 block text-3xs uppercase tracking-wider font-semibold">Insurance Provider</span>
                <span class="font-bold text-slate-200">{{ p.insuranceProvider || 'Self-Pay' }}</span>
              </div>
              <div class="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 font-mono">
                <span class="text-slate-400 block text-3xs uppercase tracking-wider font-semibold font-sans">Policy Number</span>
                <span class="font-bold text-indigo-300">{{ p.insurancePolicyNumber || 'POL-N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Active Allergy & Risk Safety Banner Ribbon -->
          <div class="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <i class="ri-alarm-warning-line text-xl text-rose-400"></i>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-rose-400 block">Critical Allergy & Contraindication Safety Banner</span>
                <p class="text-xs text-rose-200 font-medium">
                  <span *ngIf="patientAllergies().length > 0">
                    Active Coded Allergies: 
                    <strong *ngFor="let a of patientAllergies()" class="mr-2 underline">
                      {{ a.allergenName }} ({{ a.severity }})
                    </strong>
                  </span>
                  <span *ngIf="patientAllergies().length === 0" class="text-slate-400">
                    No active allergies documented in clinical chart.
                  </span>
                </p>
              </div>
            </div>

            <button 
              *ngIf="authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE'])"
              (click)="showAllergyModal.set(true)"
              class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition shadow-sm whitespace-nowrap">
              + Log Coded Allergy
            </button>
          </div>
        </div>

        <!-- Cohesive Patient Chart Tabs Navigation -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div class="flex border-b border-slate-800 overflow-x-auto text-xs font-bold uppercase tracking-wider">
            <button (click)="chartTab.set('summary')" [class.bg-indigo-600]="chartTab() === 'summary'" [class.text-white]="chartTab() === 'summary'" [class.text-slate-400]="chartTab() !== 'summary'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-bar-chart-box-line"></i> Chart Summary
            </button>
            <button (click)="chartTab.set('encounters')" [class.bg-indigo-600]="chartTab() === 'encounters'" [class.text-white]="chartTab() === 'encounters'" [class.text-slate-400]="chartTab() !== 'encounters'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-hospital-line"></i> Visits & Encounters ({{ patientEncounters().length }})
            </button>
            <button (click)="chartTab.set('allergies')" [class.bg-indigo-600]="chartTab() === 'allergies'" [class.text-white]="chartTab() === 'allergies'" [class.text-slate-400]="chartTab() !== 'allergies'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-alarm-warning-line"></i> Allergies ({{ patientAllergies().length }})
            </button>
            <button (click)="chartTab.set('diagnoses')" [class.bg-indigo-600]="chartTab() === 'diagnoses'" [class.text-white]="chartTab() === 'diagnoses'" [class.text-slate-400]="chartTab() !== 'diagnoses'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-list-check-2"></i> Problem List ({{ patientDiagnoses().length }})
            </button>
            <button (click)="chartTab.set('rx')" [class.bg-indigo-600]="chartTab() === 'rx'" [class.text-white]="chartTab() === 'rx'" [class.text-slate-400]="chartTab() !== 'rx'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-capsule-line"></i> eRx Orders ({{ patientRx().length }})
            </button>
            <button (click)="chartTab.set('vitals')" [class.bg-indigo-600]="chartTab() === 'vitals'" [class.text-white]="chartTab() === 'vitals'" [class.text-slate-400]="chartTab() !== 'vitals'" class="px-6 py-4 transition flex items-center gap-2">
              <i class="ri-pulse-line"></i> Observations & Vitals ({{ patientVitals().length }})
            </button>
          </div>

          <!-- Tab Content Views -->
          <div class="p-6">
            
            <!-- TAB 1: CHART SUMMARY -->
            <div *ngIf="chartTab() === 'summary'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Active Problem List Card -->
              <div class="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-white text-sm flex items-center gap-2"><i class="ri-list-check-2 text-indigo-400"></i> Active Problem List (ICD-10 / SNOMED)</h3>
                  <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showDiagnosisModal.set(true)" class="text-xs text-indigo-400 font-semibold hover:underline">+ Add Problem</button>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let d of patientDiagnoses()" class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-start text-xs">
                    <div>
                      <span class="font-bold text-white">{{ d.conditionName }}</span>
                      <p class="text-slate-400 mt-0.5">{{ d.notes }}</p>
                    </div>
                    <span class="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">{{ d.icdCode }}</span>
                  </div>
                  <p *ngIf="patientDiagnoses().length === 0" class="text-xs text-slate-500 py-3 text-center">No active diagnoses logged.</p>
                </div>
              </div>

              <!-- Active eRx Prescriptions Card -->
              <div class="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-white text-sm flex items-center gap-2"><i class="ri-capsule-line text-emerald-400"></i> Active Medication Orders (eRx)</h3>
                  <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showRxModal.set(true)" class="text-xs text-emerald-400 font-semibold hover:underline">+ Order eRx</button>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let rx of patientRx()" class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span class="font-bold text-emerald-400">{{ rx.medicationName }}</span>
                      <p class="text-slate-400 mt-0.5">{{ rx.dosage }} &bull; {{ rx.frequency }} ({{ rx.route }})</p>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-3xs font-bold">{{ rx.status }}</span>
                  </div>
                  <p *ngIf="patientRx().length === 0" class="text-xs text-slate-500 py-3 text-center">No active prescriptions.</p>
                </div>
              </div>

              <!-- Latest Physiological Vitals Card -->
              <div class="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-white text-sm flex items-center gap-2"><i class="ri-pulse-line text-amber-400"></i> Bedside Vitals & Observations</h3>
                  <button *ngIf="authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR'])" (click)="showVitalsModal.set(true)" class="text-xs text-amber-400 font-semibold hover:underline">+ Log Vitals</button>
                </div>
                <div *ngIf="patientVitals().length > 0; else noVitalsSummary" class="grid grid-cols-3 gap-3 text-center">
                  <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span class="text-3xs text-slate-400 uppercase tracking-wider block">Blood Pressure</span>
                    <strong class="text-sm font-bold text-rose-400 block mt-1">{{ patientVitals()[0].bloodPressure }}</strong>
                    <span class="text-3xs text-slate-500">mmHg</span>
                  </div>
                  <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span class="text-3xs text-slate-400 uppercase tracking-wider block">Heart Rate</span>
                    <strong class="text-sm font-bold text-emerald-400 block mt-1">{{ patientVitals()[0].heartRate }}</strong>
                    <span class="text-3xs text-slate-500">bpm</span>
                  </div>
                  <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span class="text-3xs text-slate-400 uppercase tracking-wider block">BMI Index</span>
                    <strong class="text-sm font-bold text-amber-400 block mt-1">{{ patientVitals()[0].bmi || '23.5' }}</strong>
                    <span class="text-3xs text-slate-500">kg/m²</span>
                  </div>
                </div>
                <ng-template #noVitalsSummary>
                  <p class="text-xs text-slate-500 py-3 text-center">No vital signs recorded yet.</p>
                </ng-template>
              </div>

              <!-- Recent Consultations Card -->
              <div class="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-white text-sm flex items-center gap-2"><i class="ri-hospital-line text-blue-400"></i> Recent Visits & Consultations</h3>
                  <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showEncounterModal.set(true)" class="text-xs text-indigo-400 font-semibold hover:underline">+ Log Encounter</button>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let enc of patientEncounters().slice(0, 2)" class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div class="flex justify-between font-bold text-white">
                      <span>{{ enc.encounterType }} Visit</span>
                      <span class="text-slate-400 text-3xs">{{ enc.encounterDate | date:'shortDate' }}</span>
                    </div>
                    <p class="text-slate-300 font-medium">{{ enc.chiefComplaint }}</p>
                  </div>
                  <p *ngIf="patientEncounters().length === 0" class="text-xs text-slate-500 py-3 text-center">No visits recorded.</p>
                </div>
              </div>
            </div>

            <!-- TAB 2: VISITS & ENCOUNTERS -->
            <div *ngIf="chartTab() === 'encounters'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-white text-base">Encounter Timeline & Consultation Progress Notes</h3>
                <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showEncounterModal.set(true)" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                  + Log Encounter Visit
                </button>
              </div>
              <div class="space-y-3">
                <div *ngFor="let enc of patientEncounters()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-2xs font-extrabold uppercase tracking-wider rounded-md">{{ enc.encounterType }}</span>
                      <h4 class="font-bold text-white text-sm mt-1">{{ enc.chiefComplaint }}</h4>
                    </div>
                    <span class="text-xs text-slate-400 font-mono">{{ enc.encounterDate | date:'medium' }}</span>
                  </div>
                  <p class="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">{{ enc.clinicalNotes }}</p>
                  <p *ngIf="enc.dischargeSummary" class="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40 font-medium">Discharge Summary: {{ enc.dischargeSummary }}</p>
                </div>
                <p *ngIf="patientEncounters().length === 0" class="text-xs text-slate-500 py-8 text-center">No encounter records documented.</p>
              </div>
            </div>

            <!-- TAB 3: ALLERGIES & CONTRAINDICATIONS -->
            <div *ngIf="chartTab() === 'allergies'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-white text-base">Coded Allergies & RxNorm Contraindication Profile</h3>
                <button *ngIf="authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE'])" (click)="showAllergyModal.set(true)" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition">
                  + Add Coded Allergy
                </button>
              </div>
              <div class="space-y-3">
                <div *ngFor="let a of patientAllergies()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-bold text-rose-400 text-base">{{ a.allergenName }}</h4>
                      <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-3xs font-extrabold rounded uppercase tracking-wider">{{ a.severity }} SEVERITY</span>
                    </div>
                    <p class="text-xs text-slate-300">Category: <strong>{{ a.category }}</strong> &bull; RxNorm Code: <strong class="font-mono text-indigo-400">{{ a.allergenCode || 'N/A' }}</strong></p>
                    <p class="text-xs text-slate-400">Reaction Description: {{ a.reactionDescription }}</p>
                  </div>
                  <span class="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg">{{ a.status }}</span>
                </div>
                <p *ngIf="patientAllergies().length === 0" class="text-xs text-slate-500 py-8 text-center">No active allergies documented.</p>
              </div>
            </div>

            <!-- TAB 4: DIAGNOSES & PROBLEM LIST -->
            <div *ngIf="chartTab() === 'diagnoses'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-white text-base">Active Coded Problem List (ICD-10 & SNOMED CT)</h3>
                <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showDiagnosisModal.set(true)" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                  + Add Coded Diagnosis
                </button>
              </div>
              <div class="space-y-3">
                <div *ngFor="let d of patientDiagnoses()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-white text-base">{{ d.conditionName }}</h4>
                      <p class="text-xs text-slate-400 mt-0.5">Onset Date: {{ d.onsetDate }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold rounded-lg">ICD-10: {{ d.icdCode }}</span>
                      <span class="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg">{{ d.status }}</span>
                    </div>
                  </div>
                  <p class="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">{{ d.notes }}</p>
                </div>
                <p *ngIf="patientDiagnoses().length === 0" class="text-xs text-slate-500 py-8 text-center">No coded diagnoses recorded.</p>
              </div>
            </div>

            <!-- TAB 5: eRx MEDICATION ORDERS -->
            <div *ngIf="chartTab() === 'rx'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-white text-base">Electronic Prescriptions & Medication Orders</h3>
                <button *ngIf="authService.hasRole('ROLE_DOCTOR')" (click)="showRxModal.set(true)" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition">
                  + Issue eRx Order
                </button>
              </div>
              <div class="space-y-3">
                <div *ngFor="let rx of patientRx()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div class="space-y-1">
                    <h4 class="font-bold text-emerald-400 text-base">{{ rx.medicationName }}</h4>
                    <p class="text-xs text-slate-300">
                      Dosage: <strong>{{ rx.dosage }}</strong> &bull; Route: <strong>{{ rx.route }}</strong> &bull; Frequency: <strong>{{ rx.frequency }}</strong>
                    </p>
                    <p class="text-xs text-slate-400">Duration: {{ rx.durationDays }} days &bull; Refills: {{ rx.refills }} &bull; RxNorm: <span class="font-mono text-indigo-400">{{ rx.rxNormCode || 'N/A' }}</span></p>
                  </div>
                  <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">{{ rx.status }}</span>
                </div>
                <p *ngIf="patientRx().length === 0" class="text-xs text-slate-500 py-8 text-center">No active medication orders.</p>
              </div>
            </div>

            <!-- TAB 6: OBSERVATIONS & VITALS -->
            <div *ngIf="chartTab() === 'vitals'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-white text-base">Longitudinal Time-Series Vital Signs</h3>
                <button *ngIf="authService.hasAnyRole(['ROLE_NURSE', 'ROLE_DOCTOR'])" (click)="showVitalsModal.set(true)" class="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition">
                  + Record Bedside Vitals
                </button>
              </div>
              <div class="space-y-3">
                <div *ngFor="let v of patientVitals()" class="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-3">
                  <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span class="text-xs text-slate-400 font-mono">Recorded: {{ v.recordedAt | date:'medium' }}</span>
                    <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded">BMI: {{ v.bmi || '23.5' }} kg/m²</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
                    <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span class="text-slate-400 text-3xs block">Blood Pressure</span>
                      <strong class="text-rose-400 font-bold block text-sm mt-0.5">{{ v.bloodPressure }}</strong>
                    </div>
                    <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span class="text-slate-400 text-3xs block">Heart Rate</span>
                      <strong class="text-emerald-400 font-bold block text-sm mt-0.5">{{ v.heartRate }} bpm</strong>
                    </div>
                    <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span class="text-slate-400 text-3xs block">Temperature</span>
                      <strong class="text-amber-400 font-bold block text-sm mt-0.5">{{ v.temperature }} °C</strong>
                    </div>
                    <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span class="text-slate-400 text-3xs block">Oxygen Saturation</span>
                      <strong class="text-blue-400 font-bold block text-sm mt-0.5">{{ v.oxygenSaturation }} %</strong>
                    </div>
                    <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span class="text-slate-400 text-3xs block">Blood Glucose</span>
                      <strong class="text-purple-400 font-bold block text-sm mt-0.5">{{ v.bloodGlucose || 'N/A' }} mg/dL</strong>
                    </div>
                  </div>
                </div>
                <p *ngIf="patientVitals().length === 0" class="text-xs text-slate-500 py-8 text-center">No vital signs recorded.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Empty State if No Patient Selected -->
      <ng-template #noPatientSelected>
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <i class="ri-contacts-book-line text-4xl text-indigo-400"></i>
          <h3 class="text-xl font-bold text-white">Select a Patient Profile from Master Patient Index</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">Choose a patient from the horizontal selection bar above or use the MPI search input to view full clinical chart details.</p>
        </div>
      </ng-template>

      <!-- MODAL 1: INTAKE NEW PATIENT -->
      <div *ngIf="showIntakeModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white">Demographic Intake Registration</h3>
            <button (click)="showIntakeModal.set(false)" class="text-slate-400 hover:text-white text-xl font-bold">×</button>
          </div>
          <form (ngSubmit)="savePatient()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input type="text" [(ngModel)]="newPatient.fullName" name="fullName" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">SSN</label>
                <input type="text" [(ngModel)]="newPatient.ssn" name="ssn" placeholder="XXX-XX-XXXX" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Date of Birth</label>
                <input type="date" [(ngModel)]="newPatient.dateOfBirth" name="dateOfBirth" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Gender</label>
                <select [(ngModel)]="newPatient.gender" name="gender" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Blood Type</label>
                <select [(ngModel)]="newPatient.bloodType" name="bloodType" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="O+">O+</option><option value="A+">A+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                  <option value="O-">O-</option><option value="A-">A-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Insurance Provider</label>
                <input type="text" [(ngModel)]="newPatient.insuranceProvider" name="insuranceProvider" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Policy Number</label>
                <input type="text" [(ngModel)]="newPatient.insurancePolicyNumber" name="insurancePolicyNumber" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showIntakeModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">Register Patient</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL 2: LOG ALLERGY -->
      <div *ngIf="showAllergyModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white">Log Coded Allergy</h3>
            <button (click)="showAllergyModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>
          <form (ngSubmit)="saveAllergy()" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Allergen Name *</label>
              <input type="text" [(ngModel)]="newAllergyInput.allergenName" name="allergenName" required placeholder="e.g. Penicillin, Latex, Peanuts" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Category</label>
                <select [(ngModel)]="newAllergyInput.category" name="category" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="MEDICATION">Medication</option><option value="FOOD">Food</option><option value="ENVIRONMENTAL">Environmental</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Severity Level</label>
                <select [(ngModel)]="newAllergyInput.severity" name="severity" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="MILD">Mild</option><option value="MODERATE">Moderate</option><option value="SEVERE">Severe</option><option value="LIFE_THREATENING">Life-Threatening</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Reaction Description</label>
              <textarea [(ngModel)]="newAllergyInput.reactionDescription" name="reactionDescription" rows="2" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showAllergyModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl">Save Allergy</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL 3: LOG DIAGNOSIS -->
      <div *ngIf="showDiagnosisModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white">Add Coded Problem (Diagnosis)</h3>
            <button (click)="showDiagnosisModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>
          <form (ngSubmit)="saveDiagnosis()" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Condition Name *</label>
              <input type="text" [(ngModel)]="newDiagnosisInput.conditionName" name="conditionName" required placeholder="e.g. Essential Hypertension" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">ICD-10 Code</label>
                <input type="text" [(ngModel)]="newDiagnosisInput.icdCode" name="icdCode" placeholder="e.g. I10" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Onset Date</label>
                <input type="date" [(ngModel)]="newDiagnosisInput.onsetDate" name="onsetDate" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Notes</label>
              <textarea [(ngModel)]="newDiagnosisInput.notes" name="notes" rows="2" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showDiagnosisModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">Save Diagnosis</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL 4: ISSUE eRx WITH SMART SAFETY ALERT -->
      <div *ngIf="showRxModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-emerald-400">Issue Electronic Prescription (eRx)</h3>
            <button (click)="showRxModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>

          <!-- Smart Safety Alert Display -->
          <div *ngIf="safetyAlert()" class="p-4 bg-rose-950 border border-rose-600 rounded-2xl space-y-2">
            <div class="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <i class="ri-alarm-warning-fill text-rose-400"></i> SMART SAFETY ENGINE CONTRAINDICATION ALERT
            </div>
            <p class="text-xs text-rose-100 font-medium">{{ safetyAlert()?.message }}</p>
            <div class="flex justify-end gap-2 pt-1">
              <button (click)="safetyAlert.set(null)" class="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg">Revise Order</button>
              <button (click)="confirmOverrideRx()" class="px-3 py-1.5 bg-rose-600 text-xs text-white font-bold rounded-lg shadow">Authorize Override (Log Audit)</button>
            </div>
          </div>

          <form (ngSubmit)="performSafetyCheckAndSaveRx()" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Medication Name *</label>
              <input type="text" [(ngModel)]="newRxInput.medicationName" name="medicationName" required placeholder="e.g. Amoxicillin 500mg" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Dosage</label>
                <input type="text" [(ngModel)]="newRxInput.dosage" name="dosage" placeholder="500mg" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Route</label>
                <select [(ngModel)]="newRxInput.route" name="route" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="Oral">Oral</option><option value="IV">IV</option><option value="Subcutaneous">Subcutaneous</option><option value="Topical">Topical</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Frequency</label>
                <input type="text" [(ngModel)]="newRxInput.frequency" name="frequency" placeholder="Twice daily" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Duration (Days)</label>
                <input type="number" [(ngModel)]="newRxInput.durationDays" name="durationDays" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showRxModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Verify & Issue eRx</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL 5: LOG ENCOUNTER -->
      <div *ngIf="showEncounterModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-indigo-400">Log Clinical Visit Encounter</h3>
            <button (click)="showEncounterModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>
          <form (ngSubmit)="saveEncounter()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Encounter Type</label>
                <select [(ngModel)]="newEncounterInput.encounterType" name="encounterType" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="Outpatient">Outpatient</option><option value="Inpatient">Inpatient</option><option value="Emergency">Emergency</option><option value="Telehealth">Telehealth</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Status</label>
                <select [(ngModel)]="newEncounterInput.status" name="status" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Chief Complaint *</label>
              <input type="text" [(ngModel)]="newEncounterInput.chiefComplaint" name="chiefComplaint" required class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Clinical Notes</label>
              <textarea [(ngModel)]="newEncounterInput.clinicalNotes" name="clinicalNotes" rows="3" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showEncounterModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">Save Encounter</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL 6: BEDSIDE VITALS -->
      <div *ngIf="showVitalsModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-amber-400">Record Bedside Vitals</h3>
            <button (click)="showVitalsModal.set(false)" class="text-slate-400 text-xl font-bold">×</button>
          </div>
          <form (ngSubmit)="saveVitals()" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Blood Pressure (mmHg)</label>
              <input type="text" [(ngModel)]="newVitalsInput.bloodPressure" name="bloodPressure" placeholder="120/80" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Heart Rate</label>
                <input type="number" [(ngModel)]="newVitalsInput.heartRate" name="heartRate" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Temp (°C)</label>
                <input type="number" step="0.1" [(ngModel)]="newVitalsInput.temperature" name="temperature" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">SpO2 (%)</label>
                <input type="number" [(ngModel)]="newVitalsInput.oxygenSaturation" name="oxygenSaturation" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">Height (cm)</label>
                <input type="number" [(ngModel)]="newVitalsInput.heightCm" name="heightCm" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Weight (kg)</label>
                <input type="number" [(ngModel)]="newVitalsInput.weightKg" name="weightKg" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Glucose (mg/dL)</label>
                <input type="number" [(ngModel)]="newVitalsInput.bloodGlucose" name="bloodGlucose" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showVitalsModal.set(false)" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl">Save Vitals</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class PatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  filteredPatients = signal<Patient[]>([]);
  searchQuery = '';

  selectedPatient = signal<Patient | null>(null);
  patientEncounters = signal<Encounter[]>([]);
  patientAllergies = signal<Allergy[]>([]);
  patientDiagnoses = signal<Diagnosis[]>([]);
  patientVitals = signal<Vitals[]>([]);
  patientRx = signal<Prescription[]>([]);
  
  chartTab = signal<'summary' | 'encounters' | 'allergies' | 'diagnoses' | 'rx' | 'vitals'>('summary');

  showIntakeModal = signal(false);
  showAllergyModal = signal(false);
  showDiagnosisModal = signal(false);
  showRxModal = signal(false);
  showEncounterModal = signal(false);
  showVitalsModal = signal(false);

  safetyAlert = signal<SafetyCheckResult | null>(null);

  newPatient: Partial<Patient> = { fullName: '', ssn: '', dateOfBirth: '1990-01-01', gender: 'Male', bloodType: 'O+', phone: '', email: '', insuranceProvider: 'BlueCross BlueShield', insurancePolicyNumber: 'BCBS-98741' };
  newAllergyInput: any = { allergenName: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };
  newDiagnosisInput: any = { conditionName: '', icdCode: '', onsetDate: '2026-01-01', notes: '', status: 'ACTIVE' };
  newRxInput: any = { medicationName: '', dosage: '500mg', route: 'Oral', frequency: 'Twice daily', durationDays: 7, refills: 1, status: 'ACTIVE' };
  newEncounterInput: any = { encounterType: 'OUTPATIENT', chiefComplaint: '', clinicalNotes: '', status: 'COMPLETED' };
  newVitalsInput: any = { bloodPressure: '120/80', heartRate: 72, temperature: 36.8, oxygenSaturation: 98, heightCm: 175, weightKg: 70, bloodGlucose: 95 };

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {}

  ngOnInit(): void {
    if (this.authService.hasRole('ROLE_PATIENT')) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          if (p) this.selectPatient(p);
        });
      }
    } else {
      this.loadPatients();
    }
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.filteredPatients.set(data);
        const active = this.patientContext.activePatient();
        if (active) {
          this.selectPatient(active);
        } else if (data.length > 0) {
          this.selectPatient(data[0]);
        }
      }
    });
  }

  executeMpiSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPatients.set(this.patients());
      return;
    }

    this.apiService.searchPatients(this.searchQuery).subscribe({
      next: (data) => this.filteredPatients.set(data)
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.patientContext.setActivePatient(patient);
    this.apiService.getEncountersByPatient(patient.id).subscribe(e => this.patientEncounters.set(e));
    this.apiService.getAllergiesByPatient(patient.id).subscribe(a => this.patientAllergies.set(a));
    this.apiService.getDiagnosesByPatient(patient.id).subscribe(d => this.patientDiagnoses.set(d));
    this.apiService.getVitalsByPatient(patient.id).subscribe(v => this.patientVitals.set(v));
    this.apiService.getPrescriptionsByPatient(patient.id).subscribe(rx => this.patientRx.set(rx));
  }

  savePatient(): void {
    if (!this.newPatient.fullName) return;
    this.apiService.createPatient(this.newPatient).subscribe({
      next: (p) => {
        this.showIntakeModal.set(false);
        this.loadPatients();
        this.selectPatient(p);
      }
    });
  }

  saveAllergy(): void {
    const p = this.selectedPatient();
    if (!p || !this.newAllergyInput.allergenName) return;
    const payload = { ...this.newAllergyInput, patient: { id: p.id } };
    this.apiService.createAllergy(payload).subscribe({
      next: () => {
        this.showAllergyModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveDiagnosis(): void {
    const p = this.selectedPatient();
    if (!p || !this.newDiagnosisInput.conditionName) return;
    const payload = { ...this.newDiagnosisInput, patient: { id: p.id } };
    this.apiService.createDiagnosis(payload).subscribe({
      next: () => {
        this.showDiagnosisModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  performSafetyCheckAndSaveRx(): void {
    const p = this.selectedPatient();
    if (!p || !this.newRxInput.medicationName) return;

    this.apiService.checkPrescriptionSafety(p.id, this.newRxInput.medicationName!).subscribe({
      next: (res) => {
        if (!res.safe) {
          this.safetyAlert.set(res);
        } else {
          this.confirmSaveRx();
        }
      }
    });
  }

  confirmOverrideRx(): void {
    this.confirmSaveRx(true);
  }

  confirmSaveRx(override = false): void {
    const p = this.selectedPatient();
    if (!p) return;
    const payload = { ...this.newRxInput, patient: { id: p.id } };
    this.apiService.createPrescription(payload, override).subscribe({
      next: () => {
        this.safetyAlert.set(null);
        this.showRxModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveEncounter(): void {
    const p = this.selectedPatient();
    if (!p || !this.newEncounterInput.chiefComplaint) return;
    const payload = { ...this.newEncounterInput, patient: { id: p.id } };
    this.apiService.createEncounter(payload).subscribe({
      next: () => {
        this.showEncounterModal.set(false);
        this.selectPatient(p);
      }
    });
  }

  saveVitals(): void {
    const p = this.selectedPatient();
    if (!p) return;
    const payload = { ...this.newVitalsInput, patient: { id: p.id } };
    this.apiService.recordVitals(payload).subscribe({
      next: () => {
        this.showVitalsModal.set(false);
        this.selectPatient(p);
      }
    });
  }
}
