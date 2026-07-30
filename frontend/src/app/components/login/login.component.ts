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
    <div class="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      <!-- LEFT COLUMN -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden flex-col justify-between p-12 text-white border-r border-white/5">
        <!-- Background Hero Image with Dark Gradient Overlay -->
        <img 
          src="/assets/images/hospital_hero.jpg" 
          alt="MedVault EHR Architecture" 
          class="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-[20s] ease-linear hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30 backdrop-blur-[2px]"></div>

        <!-- Top Left Brand Badge -->
        <div class="relative z-10 flex items-center gap-4 cursor-pointer">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-indigo-400/30 text-indigo-400 font-bold">
            <i class="ri-heart-pulse-fill text-2xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              MedVault <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold uppercase tracking-wider">Enterprise EHR</span>
            </h1>
            <p class="text-[11px] text-slate-400 font-medium tracking-wide">Healthcare Information System</p>
          </div>
        </div>

        <!-- Bottom Hero Copy & Value Props -->
        <div class="relative z-10 space-y-8 max-w-xl">
          <div class="space-y-4">
            <h2 class="text-5xl font-black text-white tracking-tight leading-[1.1]">
              The Future of <br/>
              <span class="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Connected Healthcare.</span>
            </h2>
            <p class="text-slate-400 text-base leading-relaxed max-w-md">
              Unified role-tailored workspaces with individual patient portal access, real-time RxNorm allergy checks, and immutable WORM compliance logging.
            </p>
          </div>

          <!-- Feature Tag Pills -->
          <div class="flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
            <span class="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> FHIR R4 Engine
            </span>
            <span class="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span> Patient Scoping
            </span>
            <span class="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-400"></span> WORM Vault
            </span>
          </div>
        </div>

        <!-- Footer Copyright on Left -->
        <div class="relative z-10 text-xs text-slate-500 font-medium">
          &copy; 2026 MedVault System. All rights reserved.
        </div>
      </div>

      <!-- RIGHT COLUMN: Authentication Form & Persona Switcher -->
      <div class="w-full lg:w-1/2 bg-slate-950 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative z-10 overflow-y-auto">
        
        <!-- Top Navigation Back to Home -->
        <div class="flex justify-between items-center mb-12">
          <!-- Mobile Brand Logo -->
          <div class="flex items-center gap-3 lg:hidden">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><i class="ri-heart-pulse-fill text-lg"></i></div>
            <span class="font-bold text-white text-lg">MedVault</span>
          </div>

          <a routerLink="/" class="ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <i class="ri-home-4-line"></i> Back to Home
          </a>
        </div>

        <!-- Center Main Form Container -->
        <div class="max-w-[26rem] w-full mx-auto space-y-10 my-auto">
          
          <!-- Header Title -->
          <div class="space-y-3 text-center lg:text-left">
            <h2 class="text-3xl lg:text-4xl font-black text-white tracking-tight">Sign In</h2>
            <p class="text-slate-400 text-sm">
              Select your persona or enter your credentials.
            </p>
          </div>

          <!-- Mode Toggle Tabs (Pill Design) -->
          <div class="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/5 flex relative">
            <button 
              (click)="activeTab.set('persona')" 
              [class]="activeTab() === 'persona' ? 'text-white' : 'text-slate-400 hover:text-slate-200'" 
              class="flex-1 py-3 text-sm font-semibold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2">
              <i class="ri-group-line"></i> Personas
            </button>
            <button 
              (click)="activeTab.set('credentials')" 
              [class]="activeTab() === 'credentials' ? 'text-white' : 'text-slate-400 hover:text-slate-200'" 
              class="flex-1 py-3 text-sm font-semibold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2">
              <i class="ri-lock-password-line"></i> Credentials
            </button>
            
            <!-- Sliding Background Pill -->
            <div 
              class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 border border-white/10 shadow-sm rounded-xl transition-transform duration-300 ease-out"
              [ngStyle]="{'transform': activeTab() === 'persona' ? 'translateX(0)' : 'translateX(calc(100% + 4px))'}">
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage()" class="p-4 bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm rounded-2xl text-rose-400 text-sm flex items-center gap-3">
            <i class="ri-error-warning-fill text-xl"></i>
            <span class="font-medium">{{ errorMessage() }}</span>
          </div>

          <!-- TAB 1: PERSONAS -->
          <div *ngIf="activeTab() === 'persona'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <!-- Patient Portals -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Patients</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button (click)="quickLogin('user_kamran', 'patient123')" class="p-4 bg-white/5 hover:bg-teal-500/10 backdrop-blur-md border border-white/5 hover:border-teal-500/30 rounded-2xl text-left transition-all group flex flex-col items-start gap-3">
                  <div class="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center"><i class="ri-user-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">Kamran K.</p>
                    <span class="text-[10px] text-slate-400 font-mono">PAT-1001</span>
                  </div>
                </button>
                <button (click)="quickLogin('user_aarav', 'patient123')" class="p-4 bg-white/5 hover:bg-teal-500/10 backdrop-blur-md border border-white/5 hover:border-teal-500/30 rounded-2xl text-left transition-all group flex flex-col items-start gap-3">
                  <div class="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center"><i class="ri-user-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">Aarav P.</p>
                    <span class="text-[10px] text-slate-400 font-mono">PAT-1002</span>
                  </div>
                </button>
                <button (click)="quickLogin('user_ananya', 'patient123')" class="p-4 bg-white/5 hover:bg-teal-500/10 backdrop-blur-md border border-white/5 hover:border-teal-500/30 rounded-2xl text-left transition-all group flex flex-col items-start gap-3">
                  <div class="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center"><i class="ri-user-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">Ananya S.</p>
                    <span class="text-[10px] text-slate-400 font-mono">PAT-1003</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Physicians -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Physicians</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button (click)="quickLogin('doctor_mahtab', 'doctor123')" class="p-4 bg-white/5 hover:bg-emerald-500/10 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left transition-all group flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg"><i class="ri-stethoscope-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">Dr. Mahtab Khan</p>
                    <span class="text-[11px] text-slate-400">Cardiology</span>
                  </div>
                </button>
                <button (click)="quickLogin('doctor_rajesh', 'doctor123')" class="p-4 bg-white/5 hover:bg-emerald-500/10 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left transition-all group flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg"><i class="ri-brain-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">Dr. Rajesh Sharma</p>
                    <span class="text-[11px] text-slate-400">Neurology</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Staff & Admin -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clinical Staff & Admin</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button (click)="quickLogin('nurse_priya', 'nurse123')" class="p-3 bg-white/5 hover:bg-amber-500/10 backdrop-blur-md border border-white/5 hover:border-amber-500/30 rounded-2xl text-left transition-all group flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center"><i class="ri-nurse-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">Nurse Priya</p>
                  </div>
                </button>
                <button (click)="quickLogin('admin', 'admin123')" class="p-3 bg-white/5 hover:bg-blue-500/10 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-2xl text-left transition-all group flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><i class="ri-settings-3-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-xs group-hover:text-blue-300 transition-colors">Admin Gupta</p>
                  </div>
                </button>
                <button (click)="quickLogin('auditor', 'auditor123')" class="p-3 bg-white/5 hover:bg-purple-500/10 backdrop-blur-md border border-white/5 hover:border-purple-500/30 rounded-2xl text-left transition-all group flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center"><i class="ri-shield-check-line"></i></div>
                  <div>
                    <p class="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">Insp. Menon</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: CREDENTIALS -->
          <div *ngIf="activeTab() === 'credentials'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <form (ngSubmit)="onLogin()" class="space-y-5">
              
              <div class="relative group">
                <input 
                  type="text" 
                  id="username"
                  [(ngModel)]="username" 
                  name="username" 
                  required 
                  class="block w-full px-4 pt-6 pb-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/10 focus:outline-none transition-all peer" 
                  placeholder=" " />
                <label 
                  for="username" 
                  class="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
                  Username / ID
                </label>
              </div>

              <div class="relative group">
                <input 
                  type="password" 
                  id="password"
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="block w-full px-4 pt-6 pb-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/10 focus:outline-none transition-all peer" 
                  placeholder=" " />
                <label 
                  for="password" 
                  class="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
                  Password
                </label>
              </div>

              <div class="pt-2">
                <button 
                  type="submit" 
                  [disabled]="loading()" 
                  class="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                  <i *ngIf="loading()" class="ri-loader-4-line animate-spin text-xl"></i>
                  <i *ngIf="!loading()" class="ri-login-circle-line text-xl"></i>
                  <span>{{ loading() ? 'Authenticating...' : 'Sign In to Portal' }}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        <!-- Right Footer Legal Links -->
        <div class="pt-12 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4 font-medium">
            <a href="#" class="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" class="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" class="hover:text-slate-300 transition-colors">Security</a>
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
        if (err.status === 0) {
          this.errorMessage.set('Cannot connect to backend server. Please verify Spring Boot server is running on http://localhost:8080.');
        } else if (typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else {
          this.errorMessage.set('Invalid username or password.');
        }
      }
    });
  }

  quickLogin(u: string, p: string): void {
    this.username = u;
    this.password = p;
    this.onLogin();
  }
}
