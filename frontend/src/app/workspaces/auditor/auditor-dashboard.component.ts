import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLog } from '../../core/models/models';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucideFileText, lucideUserCheck, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({ lucideShieldCheck, lucideFileText, lucideUserCheck, lucideSearch }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Executive Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucideShieldCheck" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Compliance & Audit Workspace
              <span hlmBadge variant="outline" class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                HIPAA WORM Vault
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Read-only compliance monitoring, immutable access audit ledger, and forensic trail inspection.
            </p>
          </div>
        </div>
      </div>

      <!-- Compliance Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Audit Events"
          [value]="auditLogs().length"
          subtitle="HIPAA Compliance Ledger"
          icon="lucideShieldCheck"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Security Integrity"
          value="100%"
          subtitle="Tamper-Evident WORM Vault"
          icon="lucideUserCheck"
          iconBgClass="bg-primary/10 text-primary" />
        <app-stat-card
          title="Access Mode"
          value="Read-Only"
          subtitle="Zero Mutation Risk"
          icon="lucideFileText"
          iconBgClass="bg-accent text-foreground" />
      </div>

      <!-- Recent Access Logs Preview -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <h3 class="text-sm font-semibold text-foreground">Recent Audit Log Activity</h3>
          <a routerLink="/auditor/ledger" hlmBtn variant="outline" size="sm" class="text-xs">
            Open Full Ledger
          </a>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/40">
                <th hlmTableHead>Timestamp</th>
                <th hlmTableHead>Actor</th>
                <th hlmTableHead>Role</th>
                <th hlmTableHead>Action</th>
                <th hlmTableHead>Resource</th>
                <th hlmTableHead>Details</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr hlmTableRow *ngFor="let log of auditLogs().slice(0, 5)">
                <td hlmTableCell class="font-mono text-muted-foreground">{{ log.timestamp | date:'short' }}</td>
                <td hlmTableCell class="font-semibold text-foreground">{{ log.username }}</td>
                <td hlmTableCell><span hlmBadge variant="outline" class="text-[10px]">{{ log.userRole }}</span></td>
                <td hlmTableCell><span hlmBadge variant="secondary" class="text-[10px]">{{ log.action }}</span></td>
                <td hlmTableCell class="font-mono text-[11px]">{{ log.entityName }} #{{ log.resourceId }}</td>
                <td hlmTableCell class="text-muted-foreground truncate max-w-xs">{{ log.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AuditorDashboardComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAuditLogs().subscribe((logs) => this.auditLogs.set(logs));
  }
}
