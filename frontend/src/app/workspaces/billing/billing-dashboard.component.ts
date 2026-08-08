import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideReceipt,
  lucideCreditCard,
  lucideDollarSign,
  lucideTrendingUp,
  lucideFileCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-dashboard',
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
    provideIcons({
      lucideReceipt,
      lucideCreditCard,
      lucideDollarSign,
      lucideTrendingUp,
      lucideFileCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Billing Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucideReceipt" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Revenue Cycle & Billing Operations
              <span hlmBadge variant="secondary" class="text-[11px]">Billing Officer</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Patient invoicing, insurance claims submission, and financial reconciliation.</p>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Total Monthly Revenue"
          value="$42,850"
          subtitle="Processed Patient Billing"
          icon="lucideDollarSign"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Pending Claims"
          value="14 Claims"
          subtitle="Awaiting Insurance Settlement"
          icon="lucideCreditCard"
          iconBgClass="bg-amber-500/10 text-amber-600" />
        <app-stat-card
          title="Clean Claim Rate"
          value="98.4%"
          subtitle="First-Pass Compliance Rate"
          icon="lucideTrendingUp"
          iconBgClass="bg-sky-500/10 text-sky-600" />
      </div>

      <!-- Financial Invoices Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-foreground">Patient Invoices & Insurance Ledger</h2>
            <p class="text-xs text-muted-foreground">Manage generated appointment billings, co-pays, and insurance claims.</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Invoice ID</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Insurance Carrier</th>
                <th hlmTableHead class="text-xs font-semibold">Net Payable</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Billing Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let invoice of invoices()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-foreground">{{ invoice.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ invoice.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ invoice.carrier }}</td>
                <td hlmTableCell class="text-xs font-semibold text-emerald-600">\${{ invoice.amount }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="invoice.status === 'PAID' ? 'default' : 'outline'" class="text-[10px]">
                    {{ invoice.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-emerald-600 hover:text-emerald-700" (click)="processClaim(invoice)">
                    Submit Claim
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class BillingDashboardComponent implements OnInit {
  invoices = signal([
    { id: 'INV-1001', patientName: 'Kamran Khan', carrier: 'Star Health Insurance', amount: 150.0, status: 'PAID' },
    { id: 'INV-1002', patientName: 'Aarav Patel', carrier: 'HDFC ERGO Health', amount: 280.0, status: 'PENDING' },
    { id: 'INV-1003', patientName: 'Ananya Sharma', carrier: 'ICICI Lombard', amount: 95.0, status: 'PAID' },
    { id: 'INV-1004', patientName: 'Rohan Mehta', carrier: 'Care Health Insurance', amount: 210.0, status: 'PENDING' },
  ]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}

  processClaim(invoice: any): void {
    alert(`Submitted insurance claim for invoice ${invoice.id} (${invoice.patientName}).`);
  }
}
