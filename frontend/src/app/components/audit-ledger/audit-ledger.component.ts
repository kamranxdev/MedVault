import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLog } from '../../core/models/models';

@Component({
  selector: 'app-audit-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Enterprise Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">🛡️</span>
            <h1 class="text-2xl font-bold text-white tracking-tight">HIPAA Compliance & WORM Audit Vault</h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Immutable Write-Once-Read-Many (WORM) ledger capturing clinical access events, role assertions, and eRx safety alerts.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="exportAuditLogJSON()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md">
            Export JSON
          </button>
          <button (click)="exportAuditLogCSV()" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md">
            Export CSV Report
          </button>
        </div>
      </div>

      <!-- Compliance Metrics Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <p class="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Total WORM Audit Logs</p>
          <p class="text-2xl font-black text-white mt-1">{{ auditLogs().length }}</p>
        </div>
        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <p class="text-3xs font-extrabold text-rose-400 uppercase tracking-wider">Contraindication Alerts</p>
          <p class="text-2xl font-black text-rose-400 mt-1">{{ getAlertCount() }}</p>
        </div>
        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <p class="text-3xs font-extrabold text-indigo-400 uppercase tracking-wider">Resource Reads</p>
          <p class="text-2xl font-black text-indigo-400 mt-1">{{ getActionCount('READ') }}</p>
        </div>
        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <p class="text-3xs font-extrabold text-emerald-400 uppercase tracking-wider">Data Mutations</p>
          <p class="text-2xl font-black text-emerald-400 mt-1">{{ getActionCount('CREATE') + getActionCount('UPDATE') }}</p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex items-center gap-3 shadow-xl">
        <span class="text-slate-400">🔍</span>
        <input 
          [(ngModel)]="searchQuery" 
          (input)="onSearchChange()" 
          placeholder="Filter by Actor Username, Role (ROLE_DOCTOR), Action (CREATE, READ, ERX_ALERT), Entity Name, or Resource ID..." 
          class="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono" />
      </div>

      <!-- Audit Ledger Table -->
      <div class="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div *ngIf="loading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p class="text-slate-400 text-xs mt-2">Querying WORM Audit Ledger...</p>
        </div>

        <div class="overflow-x-auto" *ngIf="!loading()">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-3xs uppercase font-extrabold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th class="px-6 py-4">Timestamp (UTC)</th>
                <th class="px-6 py-4">Actor Username</th>
                <th class="px-6 py-4">Role Assertion</th>
                <th class="px-6 py-4">Action</th>
                <th class="px-6 py-4">Entity Target</th>
                <th class="px-6 py-4">Resource ID</th>
                <th class="px-6 py-4">Audit Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono text-xs">
              <tr *ngFor="let log of auditLogs()" class="hover:bg-slate-800/40 transition">
                <td class="px-6 py-4 text-slate-400">
                  {{ log.timestamp | date:'medium' }}
                </td>
                <td class="px-6 py-4 font-bold text-white">
                  {{ log.username }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {{ log.userRole }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getActionBadge(log.action)" class="px-2.5 py-0.5 rounded font-bold">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-300">
                  {{ log.entityName }}
                </td>
                <td class="px-6 py-4 text-slate-400">
                  {{ log.resourceId || 'N/A' }}
                </td>
                <td class="px-6 py-4 font-sans text-slate-300">
                  {{ log.details }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLedgerComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);
  loading = signal<boolean>(false);
  searchQuery = '';

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.apiService.getAuditLogs(this.searchQuery).subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(): void {
    this.loadLogs();
  }

  getAlertCount(): number {
    return this.auditLogs().filter(l => l.action === 'ERX_ALERT').length;
  }

  getActionCount(action: string): number {
    return this.auditLogs().filter(l => l.action === action).length;
  }

  getActionBadge(action: string): string {
    switch (action) {
      case 'ERX_ALERT': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'CREATE': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'UPDATE': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'READ': return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }

  exportAuditLogJSON(): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.auditLogs(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedVault_Audit_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  exportAuditLogCSV(): void {
    const headers = ["ID", "Timestamp", "Actor", "Role", "Action", "Entity", "ResourceID", "Details"];
    const rows = this.auditLogs().map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.entityName}"`,
      `"${l.resourceId || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `MedVault_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
