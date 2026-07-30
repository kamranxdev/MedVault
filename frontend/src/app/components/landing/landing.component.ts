import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 lg:pb-0">
      
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <i class="ri-heart-pulse-fill text-xl"></i>
          </div>
          <div>
            <span class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              MedVault <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase tracking-wider backdrop-blur-md">Enterprise</span>
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" class="hover:text-white transition-colors duration-200">Features</a>
          <a href="#workspaces" class="hover:text-white transition-colors duration-200">Workspaces</a>
          <a href="#security" class="hover:text-white transition-colors duration-200">Security</a>
          <a href="#architecture" class="hover:text-white transition-colors duration-200">Architecture</a>
        </div>

        <!-- Auth Navigation Action Button -->
        <div class="flex items-center gap-4">
          <a routerLink="/login" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-medium text-sm rounded-lg transition-all duration-300 flex items-center gap-2 group">
            <i class="ri-login-circle-line group-hover:translate-x-0.5 transition-transform"></i> Sign In
          </a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-20 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div class="absolute top-1/4 -left-64 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl"></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <!-- Hero Left Copy -->
          <div class="space-y-8">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span>FHIR R4 & HIPAA Compliant</span>
            </div>

            <h1 class="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              The Future of <br />
              <span class="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">Connected Healthcare.</span>
            </h1>

            <p class="text-slate-400 text-lg leading-relaxed max-w-xl">
              MedVault empowers healthcare systems with individual patient self-service portals, physician desk workspaces, real-time Smart Safety contraindication checking, and immutable WORM compliance audit logs.
            </p>

            <div class="flex flex-wrap gap-4">
              <a routerLink="/login" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5">
                Get Started <i class="ri-arrow-right-line"></i>
              </a>
              <a href="#features" class="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2">
                Explore Platform <i class="ri-compass-3-line"></i>
              </a>
            </div>

            <!-- Trust / Spec Badges -->
            <div class="pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <strong class="text-white text-2xl font-bold block mb-1">100%</strong>
                <span class="text-xs text-slate-400 font-medium">Patient Scoping</span>
              </div>
              <div>
                <strong class="text-emerald-400 text-2xl font-bold block mb-1">RxNorm</strong>
                <span class="text-xs text-slate-400 font-medium">Safety Engine</span>
              </div>
              <div>
                <strong class="text-purple-400 text-2xl font-bold block mb-1">WORM</strong>
                <span class="text-xs text-slate-400 font-medium">Vault Storage</span>
              </div>
            </div>
          </div>

          <!-- Hero Right Graphic Backdrop Card -->
          <div class="relative">
            <div class="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-900/20 group">
              <div class="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-900/40 to-transparent z-10 pointer-events-none"></div>
              <img src="/assets/images/hospital_hero.jpg" alt="MedVault Healthcare Center" class="w-full h-[540px] object-cover scale-105 group-hover:scale-110 transition-transform duration-1000" />

              <!-- Overlay Card Badge -->
              <div class="absolute bottom-8 left-8 right-8 p-6 bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-white/10 z-20 shadow-xl">
                <div class="flex justify-between items-center mb-3">
                  <span class="font-medium text-white flex items-center gap-2 text-sm">
                    <i class="ri-server-line text-emerald-400"></i> Live EHR Node Status
                  </span>
                  <span class="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md font-semibold tracking-wider">ONLINE</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Master Patient Index (MPI), SOAP Notes, eRx Orders, Bedside Vitals Flowsheets, and HIPAA WORM Compliance Vault currently active.
                </p>
              </div>
            </div>
            
            <!-- Floating Decorative Elements -->
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-40"></div>
            <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-2xl opacity-30"></div>
          </div>

        </div>
      </section>

      <!-- Features Grid Section -->
      <section id="features" class="py-24 px-6 relative border-t border-white/5 bg-slate-900/30">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div class="lg:col-span-1 space-y-4">
              <h2 class="text-sm font-bold tracking-widest text-indigo-400 uppercase">Core Capabilities</h2>
              <h3 class="text-3xl md:text-4xl font-bold text-white leading-tight">Advanced tools for modern healthcare.</h3>
              <p class="text-slate-400">Built to ensure security, improve patient outcomes, and streamline clinical workflows with state-of-the-art technology.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-git-merge-line text-2xl text-blue-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">FHIR R4 Interoperability</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Seamlessly exchange health data using the latest HL7 FHIR R4 standards for maximum compatibility.</p>
            </div>
            
            <!-- Feature 2 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-medicine-bottle-line text-2xl text-emerald-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">Smart Allergy Engine</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Real-time RxNorm cross-checking prevents adverse drug events with intelligent contraindication alerts.</p>
            </div>

            <!-- Feature 3 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-user-heart-line text-2xl text-teal-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">Individual Patient Scoping</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Strict data segregation ensures patients only see their own information securely and privately.</p>
            </div>

            <!-- Feature 4 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-shield-keyhole-line text-2xl text-purple-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">HIPAA WORM Vault</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Immutable Write-Once-Read-Many audit logs satisfy rigorous HIPAA § 164.312 tracking requirements.</p>
            </div>

            <!-- Feature 5 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-layout-masonry-line text-2xl text-indigo-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">Multi-Persona Workspaces</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Tailored UI experiences designed specifically for doctors, nurses, patients, and admins.</p>
            </div>

            <!-- Feature 6 -->
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
              <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-pulse-line text-2xl text-rose-400"></i>
              </div>
              <h4 class="text-lg font-bold text-white mb-2">Real-Time Vitals</h4>
              <p class="text-sm text-slate-400 leading-relaxed">Instantly stream and record bedside flowsheets to the central patient chart for rapid decision-making.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Workspaces Feature Showcase Section -->
      <section id="workspaces" class="py-24 px-6 relative">
        <div class="max-w-7xl mx-auto space-y-16">
          <div class="text-center max-w-2xl mx-auto space-y-4">
            <h2 class="text-sm font-bold tracking-widest text-indigo-400 uppercase">Role-Tailored Architecture</h2>
            <h3 class="text-3xl md:text-4xl font-bold text-white leading-tight">5 Dedicated Workspaces</h3>
            <p class="text-slate-400 text-sm">Every persona experiences a custom-tailored interface matching their clinical scope and security access rights.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <!-- Workspace 1: Patient Portal -->
            <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
              <div class="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/10"><i class="ri-user-smile-line"></i></div>
              <h4 class="font-bold text-white text-lg mb-2">Patient Portal</h4>
              <p class="text-sm text-slate-400 leading-relaxed flex-grow">
                View personal health card, active prescriptions, vitals trends, and request consultations.
              </p>
            </div>

            <!-- Workspace 2: Doctor Desk -->
            <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10"><i class="ri-stethoscope-line"></i></div>
              <h4 class="font-bold text-white text-lg mb-2">Physician Desk</h4>
              <p class="text-sm text-slate-400 leading-relaxed flex-grow">
                SOAP progress notes, ICD-10 problem lists, schedule, and eRx ordering with safety checks.
              </p>
            </div>

            <!-- Workspace 3: Nurse Station -->
            <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
              <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10"><i class="ri-nurse-line"></i></div>
              <h4 class="font-bold text-white text-lg mb-2">Nurse Station</h4>
              <p class="text-sm text-slate-400 leading-relaxed flex-grow">
                Bedside vitals entry, Medication Administration Record (MAR), and ward intake census.
              </p>
            </div>

            <!-- Workspace 4: Admin Center -->
            <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10"><i class="ri-settings-4-line"></i></div>
              <h4 class="font-bold text-white text-lg mb-2">Admin Center</h4>
              <p class="text-sm text-slate-400 leading-relaxed flex-grow">
                Master Patient Index registration, RBAC management, and hospital facility metrics.
              </p>
            </div>

            <!-- Workspace 5: Compliance Vault -->
            <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10"><i class="ri-safe-2-line"></i></div>
              <h4 class="font-bold text-white text-lg mb-2">Compliance Vault</h4>
              <p class="text-sm text-slate-400 leading-relaxed flex-grow">
                Immutable WORM audit ledger, HIPAA access log inspector, and forensic export tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Security & Architecture -->
      <section id="security" class="py-24 px-6 border-t border-white/5 bg-slate-900/30">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <!-- Security -->
          <div class="space-y-8">
            <div>
              <h2 class="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2">HIPAA & Security</h2>
              <h3 class="text-3xl font-bold text-white">Military-Grade Protection</h3>
            </div>
            
            <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none">
                <i class="ri-shield-check-fill text-white"></i>
              </div>
              <div class="relative z-10 space-y-6">
                <div class="flex items-start gap-4">
                  <div class="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><i class="ri-check-line"></i></div>
                  <div>
                    <h5 class="text-white font-bold text-base mb-1">End-to-End Encryption</h5>
                    <p class="text-sm text-slate-400">All data in transit (TLS 1.3) and at rest (AES-256) is secured.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><i class="ri-check-line"></i></div>
                  <div>
                    <h5 class="text-white font-bold text-base mb-1">Strict Access Controls</h5>
                    <p class="text-sm text-slate-400">Granular Role-Based Access Control (RBAC) ensures minimum necessary access.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><i class="ri-check-line"></i></div>
                  <div>
                    <h5 class="text-white font-bold text-base mb-1">Immutable Auditing</h5>
                    <p class="text-sm text-slate-400">Cryptographically signed WORM storage for all electronic Protected Health Information (ePHI) access.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Architecture -->
          <div id="architecture" class="space-y-8">
            <div>
              <h2 class="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2">Modern Stack</h2>
              <h3 class="text-3xl font-bold text-white">Enterprise Architecture</h3>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-4">
                <i class="ri-angularjs-fill text-3xl text-red-500"></i>
                <div>
                  <div class="font-bold text-white">Angular 19+</div>
                  <div class="text-xs text-slate-400">Frontend Framework</div>
                </div>
              </div>
              <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-4">
                <i class="ri-java-fill text-3xl text-orange-400"></i>
                <div>
                  <div class="font-bold text-white">Spring Boot 3</div>
                  <div class="text-xs text-slate-400">Backend Services</div>
                </div>
              </div>
              <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-4">
                <i class="ri-database-2-fill text-3xl text-blue-400"></i>
                <div>
                  <div class="font-bold text-white">H2 / Oracle</div>
                  <div class="text-xs text-slate-400">Relational Database</div>
                </div>
              </div>
              <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-4">
                <i class="ri-key-2-fill text-3xl text-amber-400"></i>
                <div>
                  <div class="font-bold text-white">JWT Auth</div>
                  <div class="text-xs text-slate-400">Stateless Security</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 px-6">
        <div class="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-900/50">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          <div class="relative z-10 space-y-8">
            <h2 class="text-4xl md:text-5xl font-black text-white">Ready to Transform Healthcare?</h2>
            <p class="text-indigo-200 text-lg max-w-2xl mx-auto">
              Experience the power of a fully connected, secure, and modern Electronic Health Record system today.
            </p>
            <div class="pt-4">
              <a routerLink="/login" class="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-900 hover:bg-slate-50 font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg">
                Sign In to Demo <i class="ri-arrow-right-line"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 px-6 border-t border-white/10 text-sm text-slate-400 bg-slate-950">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-3">
            <i class="ri-heart-pulse-fill text-2xl text-indigo-500"></i>
            <span class="font-bold text-white">MedVault Enterprise</span>
            <span class="hidden md:inline">&bull;</span>
            <span>&copy; 2026 MedVault System. All rights reserved.</span>
          </div>

          <div class="flex items-center gap-6 font-medium">
            <a href="#" class="hover:text-white transition-colors">Privacy</a>
            <a href="#" class="hover:text-white transition-colors">Terms</a>
            <a href="#" class="hover:text-white transition-colors">HIPAA</a>
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Sign In <i class="ri-arrow-right-s-line"></i></a>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class LandingComponent {}
