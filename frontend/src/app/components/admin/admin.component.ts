import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, AuditLog } from '../../core/models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <i class="ri-settings-3-line text-2xl text-blue-500"></i>
            <h1 class="text-2xl font-bold text-white tracking-tight">System Administration & RBAC</h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            User Account Directory & Security Audit Trail (ROLE_ADMIN Only)
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p class="text-2xl font-black text-white mt-1">{{ users().length }}</p>
        </div>
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-blue-400 uppercase tracking-wider">Doctors</p>
          <p class="text-2xl font-black text-blue-400 mt-1">{{ getRoleCount('ROLE_DOCTOR') }}</p>
        </div>
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-emerald-400 uppercase tracking-wider">Nurses</p>
          <p class="text-2xl font-black text-emerald-400 mt-1">{{ getRoleCount('ROLE_NURSE') }}</p>
        </div>
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-purple-400 uppercase tracking-wider">Patients</p>
          <p class="text-2xl font-black text-purple-400 mt-1">{{ getRoleCount('ROLE_PATIENT') }}</p>
        </div>
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-rose-400 uppercase tracking-wider">Admins</p>
          <p class="text-2xl font-black text-rose-400 mt-1">{{ getRoleCount('ROLE_ADMIN') }}</p>
        </div>
        <div class="bg-slate-900/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl">
          <p class="text-3xs font-extrabold text-amber-400 uppercase tracking-wider">Auditors</p>
          <p class="text-2xl font-black text-amber-400 mt-1">{{ getRoleCount('ROLE_AUDITOR') }}</p>
        </div>
      </div>

      <!-- User Accounts Table -->
      <div class="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden p-6">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i class="ri-user-settings-line"></i> User Account Directory</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-3xs uppercase font-extrabold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Username</th>
                <th class="px-6 py-4">Full Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Specialization / Dept</th>
                <th class="px-6 py-4">Assigned Roles</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr *ngFor="let u of users()" class="hover:bg-slate-800/40 transition text-slate-300">
                <td class="px-6 py-4">#{{ u.id }}</td>
                <td class="px-6 py-4 font-bold text-white">{{ u.username }}</td>
                <td class="px-6 py-4">{{ u.fullName }}</td>
                <td class="px-6 py-4">{{ u.email }}</td>
                <td class="px-6 py-4">{{ u.specialization || u.department || 'N/A' }}</td>
                <td class="px-6 py-4 flex gap-1 flex-wrap">
                  <span *ngFor="let r of u.roles" [class]="getRoleBadge(r)" class="px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider">
                    {{ r.replace('ROLE_', '') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  auditLogs = signal<AuditLog[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe(u => this.users.set(u));
    this.apiService.getAuditLogs().subscribe(l => this.auditLogs.set(l));
  }

  getRoleCount(role: string): number {
    return this.users().filter(u => u.roles.includes(role)).length;
  }

  getRoleBadge(role: string): string {
    if (role.includes('ADMIN')) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    if (role.includes('DOCTOR')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (role.includes('NURSE')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (role.includes('AUDITOR')) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  }
}
