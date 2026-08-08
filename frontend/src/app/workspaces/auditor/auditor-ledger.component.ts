import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/models';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucideSearch, lucideRefreshCw } from '@ng-icons/lucide';

@Component({
  selector: 'app-auditor-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideShieldCheck, lucideSearch, lucideRefreshCw })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            HIPAA Audit Vault Ledger
            <span hlmBadge variant="secondary" class="text-[10px]">WORM Storage</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Immutable log trail for compliance reviews and access audits across the EHR system.
          </p>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadLogs()" [disabled]="loading()" class="gap-1.5 text-xs">
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
          Refresh Ledger
        </button>
      </div>

      <!-- Search Bar -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Filter audit logs by actor username, role, action, or resource..."
            class="pl-9 h-10 w-full text-xs bg-background" />
        </div>
      </div>

      <!-- Full Audit Ledger Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                <th hlmTableHead class="py-3 px-4 text-left">User / Actor</th>
                <th hlmTableHead class="py-3 px-4 text-left">Role</th>
                <th hlmTableHead class="py-3 px-4 text-left">Action</th>
                <th hlmTableHead class="py-3 px-4 text-left">Target Resource</th>
                <th hlmTableHead class="py-3 px-4 text-left">Resource ID</th>
                <th hlmTableHead class="py-3 px-4 text-left">Audit Log Details</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let log of auditLogs()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ log.timestamp | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ log.username }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px]">{{ log.userRole }}</span></td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px]">{{ log.action }}</span></td>
                <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ log.entityName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono text-[11px]">{{ log.resourceId || 'N/A' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-sm truncate">{{ log.details }}</td>
              </tr>
              <tr *ngIf="auditLogs().length === 0" hlmTableRow>
                <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">
                  No matching audit logs found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AuditorLedgerComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);
  loading = signal(false);
  searchQuery = '';

  constructor(private apiService: ApiService) {}

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
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    this.loadLogs();
  }
}
