import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30 text-white font-bold">
            🏥
          </div>
          <div>
            <span class="text-xl font-black text-white tracking-tight flex items-center gap-2">
              MedVault <span class="text-3xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold tracking-wider uppercase">Enterprise</span>
            </span>
            <span class="text-3xs text-slate-400 block -mt-0.5">EHR & Healthcare Portal</span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#features" class="hover:text-indigo-400 transition">System Features</a>
          <a href="#workspaces" class="hover:text-indigo-400 transition">Clinical Workspaces</a>
          <a href="#security" class="hover:text-indigo-400 transition">HIPAA & Security</a>
          <a href="#architecture" class="hover:text-indigo-400 transition">FHIR R4 Architecture</a>
        </div>

        <!-- Auth Navigation Action Button -->
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2">
            <span>🔑</span> Sign In to EHR
          </a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Hero Left Copy -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FHIR R4 & HIPAA § 164.312 Compliant Platform</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              The Future of <span class="bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Connected Healthcare.</span>
            </h1>

            <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
              MedVault empowers healthcare systems with individual patient self-service portals, physician desk workspaces, real-time Smart Safety contraindication checking, and immutable WORM compliance audit logs.
            </p>

            <div class="flex flex-wrap gap-4 pt-2">
              <a routerLink="/login" class="px-7 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center gap-2">
                <span>🚀</span> Access Role Demo Portals
              </a>
              <a href="#workspaces" class="px-7 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm rounded-2xl transition flex items-center gap-2">
                <span>📋</span> Explore Workspaces
              </a>
            </div>

            <!-- Trust / Spec Badges -->
            <div class="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
              <div>
                <strong class="text-white text-lg font-black block">100%</strong>
                <span>Individual Patient Data Scoping</span>
              </div>
              <div>
                <strong class="text-emerald-400 text-lg font-black block">RxNorm</strong>
                <span>Smart Contraindication Safety</span>
              </div>
              <div>
                <strong class="text-purple-400 text-lg font-black block">WORM</strong>
                <span>Immutable Audit Vault</span>
              </div>
            </div>
          </div>

          <!-- Hero Right Graphic Backdrop Card -->
          <div class="lg:col-span-5 relative">
            <div class="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img src="/assets/images/hospital_hero.jpg" alt="MedVault Healthcare Center" class="w-full h-[460px] object-cover group-hover:scale-105 transition duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <!-- Overlay Card Badge -->
              <div class="absolute bottom-6 left-6 right-6 p-5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Live EHR Node Status
                  </span>
                  <span class="text-3xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">ONLINE</span>
                </div>
                <p class="text-2xs text-slate-300">
                  Master Patient Index (MPI), SOAP Notes, eRx Orders, Bedside Vitals Flowsheets, and HIPAA WORM Compliance Vault.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- Workspaces Feature Showcase Section -->
      <section id="workspaces" class="py-20 px-4 lg:px-8 bg-slate-900/50 border-y border-slate-900">
        <div class="max-w-7xl mx-auto space-y-12">
          <div class="text-center max-w-2xl mx-auto space-y-3">
            <h2 class="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Role-Tailored Architecture</h2>
            <h3 class="text-3xl font-black text-white">5 Dedicated Clinical & Patient Workspaces</h3>
            <p class="text-slate-400 text-xs">Every persona experiences a custom-tailored interface matching their clinical scope and security access rights.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Workspace 1: Patient Portal -->
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-teal-500/60 transition space-y-3 group">
              <div class="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">👤</div>
              <h4 class="font-bold text-white text-base">Individual Patient Portal</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Strictly bound to individual patient profile. View personal health card, active prescriptions, vitals trends, and request consultations.
              </p>
              <span class="text-3xs font-bold text-teal-400 uppercase tracking-wider block">Eleanor, Robert, Sophia</span>
            </div>

            <!-- Workspace 2: Doctor Desk -->
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/60 transition space-y-3 group">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">🩺</div>
              <h4 class="font-bold text-white text-base">Physician Desk Workspace</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                SOAP progress notes, ICD-10 problem lists, consultation schedule, and eRx ordering with real-time allergy cross-checking.
              </p>
              <span class="text-3xs font-bold text-emerald-400 uppercase tracking-wider block">Dr. Jenkins, Dr. Vance</span>
            </div>

            <!-- Workspace 3: Nurse Station -->
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-amber-500/60 transition space-y-3 group">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">💉</div>
              <h4 class="font-bold text-white text-base">Nurse Station Workspace</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Bedside vitals flowsheet entry (BP, HR, Glucose, SpO2), Medication Administration Record (MAR), and ward intake census.
              </p>
              <span class="text-3xs font-bold text-amber-400 uppercase tracking-wider block">Nurse Clara Barton</span>
            </div>

            <!-- Workspace 4: Admin Center -->
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/60 transition space-y-3 group">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">⚙️</div>
              <h4 class="font-bold text-white text-base">Hospital Admin & Intake</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Master Patient Index (MPI) registration, user RBAC management, appointment scheduling dispatch, and facility metrics.
              </p>
              <span class="text-3xs font-bold text-blue-400 uppercase tracking-wider block">Dr. Alexander Wright</span>
            </div>

            <!-- Workspace 5: Compliance Vault -->
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-purple-500/60 transition space-y-3 group">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">🛡️</div>
              <h4 class="font-bold text-white text-base">HIPAA WORM Compliance Vault</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Immutable WORM audit ledger, HIPAA § 164.312(b) access log inspector, and forensic compliance export tools.
              </p>
              <span class="text-3xs font-bold text-purple-400 uppercase tracking-wider block">Inspector Vance</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 px-4 lg:px-8 border-t border-slate-900 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏥</span>
            <span class="font-bold text-white">MedVault Enterprise EHR Platform</span>
            <span>&bull; &copy; 2026 MedVault System. All rights reserved.</span>
          </div>

          <div class="flex items-center gap-6 text-slate-400">
            <a href="#" class="hover:text-white transition">Privacy Policy</a>
            <a href="#" class="hover:text-white transition">Terms of Service</a>
            <a href="#" class="hover:text-white transition">HIPAA Compliance Portal</a>
            <a routerLink="/login" class="text-indigo-400 font-bold hover:underline">Sign In ➔</a>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class LandingComponent {}
