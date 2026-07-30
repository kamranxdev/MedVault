import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Allergy, Patient } from '../../core/models/models';

@Component({
  selector: 'app-allergies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-alarm-warning-line text-2xl text-rose-500"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ isPatient() ? 'My Allergies' : 'Allergies & Adverse Drug Reactions' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            RxNorm & SNOMED CT coded adverse drug reactions (ADRs), severity ratings, and real-time contraindications safety log.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            *ngIf="!isPatient()"
            [ngModel]="selectedPatientId" 
            (ngModelChange)="onPatientChange($event)"
            class="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-rose-500">
            <option [value]="null">Select Patient Profile...</option>
            <option *ngFor="let p of patientContext.patientList()" [value]="p.id">
              {{ p.fullName }} (MRN: {{ p.patientCode }})
            </option>
          </select>

          <button 
            *ngIf="authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE'])"
            (click)="showModal = true"
            [disabled]="!selectedPatientId"
            class="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2">
            <i class="ri-add-line"></i> Document Coded Allergy
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!selectedPatientId" class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <p class="text-slate-400 text-xs">Select a patient from the dropdown above to view documented coded allergy profiles.</p>
      </div>

      <div *ngIf="selectedPatientId" class="space-y-4">
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div>
          <p class="text-slate-400 text-xs mt-2">Loading allergy register...</p>
        </div>

        <div *ngIf="!loading() && allergies().length === 0" class="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p class="text-slate-400 text-xs">No documented allergies or adverse reactions on file.</p>
        </div>

        <!-- Allergy Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="!loading()">
          <div *ngFor="let alg of allergies()" class="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3 relative overflow-hidden">
            <div [class]="getSeverityBorder(alg.severity)" class="absolute top-0 left-0 bottom-0 w-1.5"></div>

            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-rose-400 flex items-center gap-2">
                  {{ alg.allergenName }}
                  <span *ngIf="alg.allergenCode" class="text-xs font-mono px-2 py-0.5 bg-slate-800 text-indigo-400 rounded">
                    {{ alg.allergenCode }}
                  </span>
                </h3>
                <span [class]="getCategoryBadge(alg.category)" class="mt-1 px-2 py-0.5 rounded text-xs font-semibold inline-block">
                  {{ alg.category }}
                </span>
              </div>

              <span [class]="getSeverityBadge(alg.severity)" class="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider">
                {{ alg.severity }}
              </span>
            </div>

            <p class="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
              <span class="font-bold text-white">Reaction Details:</span> {{ alg.reactionDescription || 'No description provided' }}
            </p>

            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span class="flex items-center gap-1">Status: <strong [class]="getStatusClass(alg.status)">{{ alg.status }}</strong></span>
              <span class="font-mono">Recorded: {{ alg.recordedAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Allergy Modal -->
      <div *ngIf="showModal && authService.hasAnyRole(['ROLE_DOCTOR', 'ROLE_NURSE'])" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white">Document Coded Allergy</h3>
            <button (click)="showModal = false" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
          </div>

          <form (ngSubmit)="saveAllergy()" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-400 mb-1">Allergen Name *</label>
              <input [(ngModel)]="newAlg.allergenName" name="allergenName" required placeholder="e.g. Penicillin, Ibuprofen, Latex..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">RxNorm / SNOMED Code</label>
                <input [(ngModel)]="newAlg.allergenCode" name="allergenCode" placeholder="e.g. RxNorm-70618" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Category</label>
                <select [(ngModel)]="newAlg.category" name="category" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="DRUG">Drug / Medication</option>
                  <option value="FOOD">Food Allergy</option>
                  <option value="ENVIRONMENTAL">Environmental</option>
                  <option value="OTHER">Other Allergen</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Severity Level</label>
                <select [(ngModel)]="newAlg.severity" name="severity" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                  <option value="LIFE_THREATENING">Life Threatening</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-400 mb-1">Status</label>
                <select [(ngModel)]="newAlg.status" name="status" class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-400 mb-1">Adverse Reaction Description</label>
              <textarea [(ngModel)]="newAlg.reactionDescription" name="reactionDescription" rows="3" placeholder="e.g. Anaphylaxis, acute hives, rash, wheezing..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="showModal = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl">Save Allergy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AllergiesComponent implements OnInit {
  allergies = signal<Allergy[]>([]);
  selectedPatientId: number | null = null;
  loading = signal<boolean>(false);
  showModal = false;

  newAlg: Partial<Allergy> = {
    allergenName: '',
    allergenCode: '',
    category: 'DRUG',
    severity: 'SEVERE',
    reactionDescription: '',
    status: 'ACTIVE'
  };

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {}

  isPatient(): boolean {
    return this.authService.hasRole('ROLE_PATIENT');
  }

  ngOnInit(): void {
    if (this.isPatient()) {
      const u = this.authService.currentUser();
      if (u) {
        this.apiService.getPatientByUserId(u.userId).subscribe(p => {
          if (p) {
            this.selectedPatientId = p.id;
            this.loadAllergies();
          }
        });
      }
    } else {
      const active = this.patientContext.activePatient();
      if (active) {
        this.selectedPatientId = active.id;
        this.loadAllergies();
      }
    }
  }

  onPatientChange(patientId: number): void {
    this.selectedPatientId = Number(patientId);
    if (this.selectedPatientId) {
      this.patientContext.selectPatientById(this.selectedPatientId);
      this.loadAllergies();
    } else {
      this.allergies.set([]);
    }
  }

  loadAllergies(): void {
    if (!this.selectedPatientId) return;
    this.loading.set(true);
    this.apiService.getAllergiesByPatient(Number(this.selectedPatientId)).subscribe({
      next: (res) => {
        this.allergies.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveAllergy(): void {
    if (!this.selectedPatientId) return;
    this.newAlg.patient = { id: Number(this.selectedPatientId) } as Patient;
    this.apiService.createAllergy(this.newAlg).subscribe(() => {
      this.showModal = false;
      this.newAlg = { allergenName: '', allergenCode: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };
      this.loadAllergies();
    });
  }

  getSeverityBorder(severity: string): string {
    switch (severity) {
      case 'LIFE_THREATENING': return 'bg-rose-500';
      case 'SEVERE': return 'bg-red-400';
      case 'MODERATE': return 'bg-amber-400';
      case 'MILD': return 'bg-yellow-300';
      default: return 'bg-blue-400';
    }
  }

  getSeverityBadge(severity: string): string {
    switch (severity) {
      case 'LIFE_THREATENING': return 'bg-rose-500/20 text-rose-500 border border-rose-500/30';
      case 'SEVERE': return 'bg-red-400/20 text-red-400 border border-red-400/30';
      case 'MODERATE': return 'bg-amber-400/20 text-amber-400 border border-amber-400/30';
      case 'MILD': return 'bg-yellow-300/20 text-yellow-300 border border-yellow-300/30';
      default: return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  }

  getCategoryBadge(category: string): string {
    switch(category) {
      case 'DRUG': return 'bg-blue-500/20 text-blue-300';
      case 'FOOD': return 'bg-emerald-500/20 text-emerald-300';
      case 'ENVIRONMENTAL': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-400';
      case 'INACTIVE': return 'text-slate-400';
      case 'RESOLVED': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  }
}
