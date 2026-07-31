import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLog } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucideDownload, lucideSearch, lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-audit-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon
  ],
  providers: [
    provideIcons({ lucideShieldCheck, lucideDownload, lucideSearch, lucideLoader2 })
  ],
  templateUrl: './audit-ledger.component.html',
  styleUrl: './audit-ledger.component.css'
})
export class AuditLedgerComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);
  filteredLogs = signal<AuditLog[]>([]);
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
    this.apiService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.filterLogs();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterLogs(): void {
    if (!this.searchQuery) {
      this.filteredLogs.set(this.auditLogs());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredLogs.set(this.auditLogs().filter(l =>
        l.username?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q) ||
        l.entityName?.toLowerCase().includes(q)
      ));
    }
  }

  exportAuditLedger(): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.auditLogs(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedVault_Audit_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
