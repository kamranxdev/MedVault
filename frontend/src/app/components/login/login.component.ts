import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans">
      
      <!-- LEFT COLUMN: High-Res Visual Backdrop & Branding Overlay (50% Width) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
        <!-- Background Hero Image with Dark Gradient Overlay -->
        <img 
          src="/assets/images/hospital_hero.jpg" 
          alt="MedVault EHR Medical Architecture" 
          class="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-90 transition duration-1000" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40"></div>

        <!-- Top Left Brand Badge -->
        <div class="relative z-10 flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/90 backdrop-blur-md flex items-center justify-center text-2xl shadow-xl border border-indigo-400/30 text-white font-bold">
            🏥
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              MedVault <span class="text-3xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold uppercase tracking-wider">Enterprise EHR</span>
            </h1>
            <p class="text-3xs text-slate-300">Healthcare Information System</p>
          </div>
        </div>

        <!-- Bottom Hero Copy & Value Props -->
        <div class="relative z-10 space-y-6 max-w-xl">
          <div class="space-y-3">
            <h2 class="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              The Future of <br/>
              <span class="bg-gradient-to-r from-indigo-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">Connected Healthcare.</span>
            </h2>
            <p class="text-slate-300 text-sm leading-relaxed">
              Unified role-tailored workspaces with individual patient portal access, real-time RxNorm allergy contraindications checking, and immutable WORM compliance logging.
            </p>
          </div>

          <!-- Feature Tag Pills -->
          <div class="flex flex-wrap gap-2 pt-2 text-2xs font-semibold text-slate-300">
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> FHIR R4 Engine Ready
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span> Individual Patient Scoping
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-purple-400"></span> HIPAA WORM Audit Vault
            </span>
          </div>
        </div>

        <!-- Footer Copyright on Left -->
        <div class="relative z-10 text-3xs text-slate-400">
          &copy; 2026 MedVault System. All rights reserved.
        </div>
      </div>

      <!-- RIGHT COLUMN: Authentication Form & Persona Switcher (50% Width) -->
      <div class="w-full lg:w-1/2 bg-slate-950 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 overflow-y-auto">
        
        <!-- Top Right Navigation Back to Home Link -->
        <div class="flex justify-between items-center mb-8">
          <!-- Mobile Brand Logo -->
          <div class="flex items-center gap-2 lg:hidden">
            <span class="text-xl">🏥</span>
            <span class="font-bold text-white text-base">MedVault</span>
          </div>

          <a routerLink="/" class="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2">
            <span>🏠</span> Back to Home
          </a>
        </div>

        <!-- Center Main Form Container -->
        <div class="max-w-md w-full mx-auto space-y-8 my-auto">
          
          <!-- Header Title -->
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-white tracking-tight">Sign In to MedVault</h2>
            <p class="text-slate-400 text-xs">
              Select your individual portal persona or enter your credentials to authenticate.
            </p>
          </div>

          <!-- Mode Toggle Tabs -->
          <div class="p-1 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-2 text-xs font-bold">
            <button 
              (click)="activeTab.set('persona')" 
              [class]="activeTab() === 'persona' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'" 
              class="py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              <span>👥</span> Persona Portals
            </button>
            <button 
              (click)="activeTab.set('credentials')" 
              [class]="activeTab() === 'credentials' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'" 
              class="py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              <span>🔒</span> Manual Credentials
            </button>
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage()" class="p-4 bg-rose-950/80 border border-rose-600/60 rounded-2xl text-rose-200 text-xs flex items-center gap-3">
            <span class="text-xl">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>

          <!-- TAB 1: INDIVIDUAL PERSONA DEMO PORTALS (1-CLICK LOGIN) -->
          <div *ngIf="activeTab() === 'persona'" class="space-y-5">
            
            <!-- Patient Portals Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-3xs font-extrabold uppercase tracking-wider text-teal-400">Individual Patient Portals</span>
                <span class="text-3xs text-slate-400">Strictly Scoped Access</span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button (click)="quickLogin('user_eleanor', 'patient123')" class="p-3 bg-slate-900/90 hover:bg-teal-950/60 hover:border-teal-500/60 border border-slate-800 rounded-2xl text-left transition group space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">E</div>
                  <p class="font-bold text-white text-xs group-hover:text-teal-300">Eleanor Vance</p>
                  <span class="text-3xs text-slate-400 block font-mono">PAT-1001</span>
                </button>

                <button (click)="quickLogin('user_robert', 'patient123')" class="p-3 bg-slate-900/90 hover:bg-teal-950/60 hover:border-teal-500/60 border border-slate-800 rounded-2xl text-left transition group space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">R</div>
                  <p class="font-bold text-white text-xs group-hover:text-teal-300">Robert Chen</p>
                  <span class="text-3xs text-slate-400 block font-mono">PAT-1002</span>
                </button>

                <button (click)="quickLogin('user_sophia', 'patient123')" class="p-3 bg-slate-900/90 hover:bg-teal-950/60 hover:border-teal-500/60 border border-slate-800 rounded-2xl text-left transition group space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">S</div>
                  <p class="font-bold text-white text-xs group-hover:text-teal-300">Sophia Martinez</p>
                  <span class="text-3xs text-slate-400 block font-mono">PAT-1003</span>
                </button>
              </div>
            </div>

            <!-- Physician Portals Section -->
            <div class="space-y-2">
              <span class="text-3xs font-extrabold uppercase tracking-wider text-emerald-400 block">Physicians & Specialists</span>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button (click)="quickLogin('doctor_jenkins', 'doctor123')" class="p-3 bg-slate-900/90 hover:bg-emerald-950/60 hover:border-emerald-500/60 border border-slate-800 rounded-2xl text-left transition group flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">🩺</div>
                  <div>
                    <p class="font-bold text-white text-xs group-hover:text-emerald-300">Dr. Sarah Jenkins</p>
                    <span class="text-3xs text-slate-400">Cardiovascular Medicine</span>
                  </div>
                </button>

                <button (click)="quickLogin('doctor_marcus', 'doctor123')" class="p-3 bg-slate-900/90 hover:bg-emerald-950/60 hover:border-emerald-500/60 border border-slate-800 rounded-2xl text-left transition group flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">🧠</div>
                  <div>
                    <p class="font-bold text-white text-xs group-hover:text-emerald-300">Dr. Marcus Vance</p>
                    <span class="text-3xs text-slate-400">Neurology & Internal Med</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Nurse, Admin & Compliance Auditor Section -->
            <div class="space-y-2">
              <span class="text-3xs font-extrabold uppercase tracking-wider text-amber-400 block">Clinical Staff & Compliance Vault</span>
              
              <div class="grid grid-cols-3 gap-2">
                <button (click)="quickLogin('nurse_clara', 'nurse123')" class="p-2.5 bg-slate-900/90 hover:bg-amber-950/60 border border-slate-800 rounded-2xl text-left transition space-y-0.5">
                  <p class="font-bold text-amber-300 text-xs">Nurse Clara</p>
                  <span class="text-3xs text-slate-400 block">ICU Vitals</span>
                </button>

                <button (click)="quickLogin('admin', 'admin123')" class="p-2.5 bg-slate-900/90 hover:bg-blue-950/60 border border-slate-800 rounded-2xl text-left transition space-y-0.5">
                  <p class="font-bold text-blue-300 text-xs">Admin Wright</p>
                  <span class="text-3xs text-slate-400 block">MPI / RBAC</span>
                </button>

                <button (click)="quickLogin('auditor', 'auditor123')" class="p-2.5 bg-slate-900/90 hover:bg-purple-950/60 border border-slate-800 rounded-2xl text-left transition space-y-0.5">
                  <p class="font-bold text-purple-300 text-xs">Insp. Vance</p>
                  <span class="text-3xs text-slate-400 block">WORM Vault</span>
                </button>
              </div>
            </div>

          </div>

          <!-- TAB 2: MANUAL CREDENTIAL SIGN IN -->
          <div *ngIf="activeTab() === 'credentials'" class="space-y-4">
            <form (ngSubmit)="onLogin()" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-3xs">Username / User ID</label>
                <input 
                  type="text" 
                  [(ngModel)]="username" 
                  name="username" 
                  placeholder="e.g. user_eleanor or doctor_jenkins" 
                  required 
                  class="w-full px-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label class="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-3xs">Password</label>
                <input 
                  type="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  class="w-full px-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <button 
                type="submit" 
                [disabled]="loading()" 
                class="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2">
                <span *ngIf="loading()" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>{{ loading() ? 'Authenticating Credentials...' : 'Authenticate & Access Portal' }}</span>
              </button>
            </form>
          </div>

        </div>

        <!-- Right Footer Legal Links -->
        <div class="pt-8 text-3xs text-slate-500 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900">
          <span>&copy; 2026 MedVault Platform</span>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" class="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" class="hover:text-slate-300 transition">HIPAA Security</a>
          </div>
        </div>

      </div>

    </div>
  `
})
export class LoginComponent {
  activeTab = signal<'persona' | 'credentials'>('persona');
  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService, 
    private patientContext: PatientContextService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.patientContext.loadContext();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(typeof err.error === 'string' ? err.error : 'Invalid username or password.');
      }
    });
  }

  quickLogin(u: string, p: string): void {
    this.username = u;
    this.password = p;
    this.onLogin();
  }
}
