import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, Allergy } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideSave,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideShieldCheck,
  lucidePhone,
  lucideMail,
  lucideMapPin,
  lucideContact2,
  lucideHeart,
  lucideUtensils,
  lucideCigarette,
  lucideWine,
  lucideActivity,
  lucideApple,
  lucideFileText,
  lucideCreditCard,
  lucideTriangleAlert,
  lucideHistory,
  lucideSparkles,
  lucidePlus,
  lucideX,
  lucideRefreshCw,
  lucideInfo,
} from '@ng-icons/lucide';

export interface HabitOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmTabsImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideSave,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideShieldCheck,
      lucidePhone,
      lucideMail,
      lucideMapPin,
      lucideContact2,
      lucideHeart,
      lucideUtensils,
      lucideCigarette,
      lucideWine,
      lucideActivity,
      lucideApple,
      lucideFileText,
      lucideCreditCard,
      lucideTriangleAlert,
      lucideHistory,
      lucideSparkles,
      lucidePlus,
      lucideX,
      lucideRefreshCw,
      lucideInfo,
    }),
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  activeTab = signal<'demographics' | 'lifestyle' | 'allergies' | 'insurance' | 'medical-alerts' | 'history'>('demographics');
  
  patient = signal<Patient | null>(null);
  clinicalAllergies = signal<Allergy[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);
  saveError = signal<string | null>(null);

  // Form Model
  profileForm: Partial<Patient> = {};

  // Preset Dietary Options
  dietaryPresets = [
    'Low Sodium',
    'Gluten-Free',
    'Vegan',
    'Vegetarian',
    'Diabetic / Low Carb',
    'Keto',
    'Low Cholesterol',
    'Dairy-Free / Lactose Intolerant',
    'Halal',
    'Kosher',
  ];

  // Preset Common Allergens
  allergenPresets = [
    'Peanuts',
    'Tree Nuts (Almonds, Walnuts)',
    'Shellfish (Shrimp, Crab)',
    'Fish (Salmon, Tuna)',
    'Milk / Lactose',
    'Eggs',
    'Wheat / Gluten',
    'Soy',
    'Sesame',
    'Sulfites / Preservatives',
  ];

  customAllergyInput = '';

  constructor(
    public apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService
  ) {}

  ngOnInit(): void {
    this.loadPatientProfile();
  }

  loadPatientProfile(): void {
    const active = this.patientContext.activePatient();
    if (active) {
      this.patient.set(active);
      this.profileForm = { ...active };
      this.fetchClinicalAllergies(active.id);
    } else {
      const user = this.authService.currentUser();
      if (user) {
        this.loading.set(true);
        this.apiService.getPatientByUserId(user.userId).subscribe({
          next: (p) => {
            this.patient.set(p);
            this.patientContext.setActivePatient(p);
            this.profileForm = { ...p };
            this.loading.set(false);
            this.fetchClinicalAllergies(p.id);
          },
          error: (err) => {
            console.error('Error fetching patient profile:', err);
            this.loading.set(false);
          },
        });
      }
    }
  }

  fetchClinicalAllergies(patientId: number): void {
    if (!patientId) return;
    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (allergies) => this.clinicalAllergies.set(allergies),
      error: () => this.clinicalAllergies.set([]),
    });
  }

  // Profile Completeness Score (%)
  completenessScore = computed(() => {
    const p = this.patient();
    if (!p) return 0;
    
    let score = 0;
    const totalFields = 10;
    
    if (p.fullName) score += 1;
    if (p.phone) score += 1;
    if (p.email) score += 1;
    if (p.address) score += 1;
    if (p.emergencyContact) score += 1;
    if (p.insuranceProvider) score += 1;
    if (p.insurancePolicyNumber) score += 1;
    if (p.dietaryHabits) score += 1;
    if (p.smokingStatus) score += 1;
    if (p.foodAllergies) score += 1;

    return Math.round((score / totalFields) * 100);
  });

  // Selected Dietary Habits List
  currentDietaryList = computed(() => {
    const habitsStr = this.profileForm.dietaryHabits || '';
    if (!habitsStr.trim()) return [];
    return habitsStr.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
  });

  toggleDietaryHabit(preset: string): void {
    const list = this.currentDietaryList();
    let updated: string[];
    if (list.includes(preset)) {
      updated = list.filter((item) => item !== preset);
    } else {
      updated = [...list, preset];
    }
    this.profileForm.dietaryHabits = updated.join(', ');
  }

  // Selected Food Allergies List
  currentFoodAllergiesList = computed(() => {
    const algStr = this.profileForm.foodAllergies || '';
    if (!algStr.trim()) return [];
    return algStr.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
  });

  toggleFoodAllergy(preset: string): void {
    const list = this.currentFoodAllergiesList();
    let updated: string[];
    if (list.includes(preset)) {
      updated = list.filter((item) => item !== preset);
    } else {
      updated = [...list, preset];
    }
    this.profileForm.foodAllergies = updated.join(', ');
  }

  addCustomAllergy(): void {
    if (!this.customAllergyInput.trim()) return;
    const item = this.customAllergyInput.trim();
    const list = this.currentFoodAllergiesList();
    if (!list.includes(item)) {
      const updated = [...list, item];
      this.profileForm.foodAllergies = updated.join(', ');
    }
    this.customAllergyInput = '';
  }

  removeFoodAllergy(allergyName: string): void {
    const list = this.currentFoodAllergiesList();
    const updated = list.filter((item) => item !== allergyName);
    this.profileForm.foodAllergies = updated.join(', ');
  }

  saveProfile(): void {
    const current = this.patient();
    if (!current || !current.id) return;

    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.apiService.updatePatient(current.id, this.profileForm).subscribe({
      next: (updated) => {
        this.patient.set(updated);
        this.patientContext.setActivePatient(updated);
        this.profileForm = { ...updated };
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 4000);
      },
      error: (err) => {
        console.error('Failed to update patient profile:', err);
        this.saving.set(false);
        this.saveError.set('Failed to save profile changes. Please verify inputs and try again.');
      },
    });
  }
}
