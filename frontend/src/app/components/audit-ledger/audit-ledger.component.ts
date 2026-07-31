import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLog } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-audit-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, CardModule, InputTextModule],
  templateUrl: './audit-ledger.component.html',
  styleUrl: './audit-ledger.component.css'
})
export class AuditLedgerComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);
  loading = signal<boolean>(false);
  searchQuery = '';

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

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
      case 'CREATE': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'READ': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'UPDATE': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'LOGIN': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'SEED': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      case 'ERX_ALERT': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
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
