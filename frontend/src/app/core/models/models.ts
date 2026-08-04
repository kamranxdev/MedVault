export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  specialization?: string;
  department?: string;
  licenseNumber?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalBoardState?: string;
  verificationStatus?: string;
  roles: string[];
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  fullName: string;
  roles: string[];
  userId: number;
  id?: number;
}

export interface Patient {
  id: number;
  patientCode: string;
  ssn?: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  coveragePlan?: string;
  medicalAlerts?: string;
  dietaryHabits?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  exerciseRoutine?: string;
  foodAllergies?: string;
  pastMedicalHistory?: string;
  seriousConditions?: string;
  surgeriesAndProcedures?: string;
  familyMedicalHistory?: string;
  user?: User;
  createdAt?: string;
}

export interface PatientClinicalHistoryDTO {
  patient: Patient;
  pastIllnesses: Diagnosis[];
  allergies: Allergy[];
  prescriptions: Prescription[];
  vitals: Vitals[];
  medicalRecords: MedicalRecord[];
  habitsSummary?: string;
  foodAllergiesSummary?: string;
  seriousConditionsSummary?: string;
  surgeriesSummary?: string;
}

export interface Encounter {
  id?: number;
  patient: Patient;
  attendingProvider?: User;
  encounterType: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY' | 'TELEHEALTH' | string;
  chiefComplaint?: string;
  clinicalNotes?: string;
  dischargeSummary?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCHARGED' | string;
  encounterDate?: string;
}

export interface Allergy {
  id?: number;
  patient: Patient;
  allergenName: string;
  allergenCode?: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER' | string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING' | string;
  reactionDescription?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED' | string;
  recordedBy?: User;
  recordedAt?: string;
}

export interface Diagnosis {
  id?: number;
  patient: Patient;
  doctor?: User;
  conditionName: string;
  icdCode?: string;
  snomedCode?: string;
  onsetDate?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | string;
  notes?: string;
  recordedAt?: string;
}

export interface MedicalRecord {
  id?: number;
  patient: Patient;
  doctor?: User;
  diagnosis: string;
  icdCode?: string;
  symptoms?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt?: string;
}

export interface Vitals {
  id?: number;
  patient: Patient;
  recordedBy?: User;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bloodGlucose?: number;
  recordedAt?: string;
}

export interface Prescription {
  id?: number;
  patient: Patient;
  doctor?: User;
  medicationName: string;
  rxNormCode?: string;
  dosage: string;
  route?: string;
  frequency: string;
  durationDays: number;
  refills?: number;
  instructions?: string;
  status: string;
  prescribedAt?: string;
}

export interface SafetyCheckResult {
  safe: boolean;
  severity: string;
  conflictingAllergen?: string;
  message: string;
  alertType?: string;
}

export interface DoctorRecommendationDTO {
  doctor: User;
  matchScore: number;
  recommendedSpecialty: string;
  matchReason: string;
  verifiedLicense: boolean;
}

export interface Appointment {
  id?: number;
  patient: Patient;
  doctor: User;
  appointmentDate: string;
  status: string;
  reason?: string;
  notes?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: number;
  username: string;
  userRole: string;
  action: string;
  entityName: string;
  resourceId?: string;
  ipAddress?: string;
  details: string;
  timestamp: string;
}
