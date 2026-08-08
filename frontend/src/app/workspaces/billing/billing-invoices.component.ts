import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt, lucideDollarSign, lucideFileText } from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideReceipt,
      lucideDollarSign,
      lucideFileText,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Patient Invoices & Accounts Ledger
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Officer</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage generated patient bills, co-pay statements, and payment tracking.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Invoice Number</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Billing Date</th>
                <th hlmTableHead class="text-xs font-semibold">Total Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Invoice Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let invoice of invoices()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-foreground">{{ invoice.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ invoice.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ invoice.date }}</td>
                <td hlmTableCell class="text-xs font-semibold text-emerald-600">\${{ invoice.amount }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="invoice.status === 'PAID' ? 'default' : 'outline'" class="text-[10px]">
                    {{ invoice.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-emerald-600 hover:text-emerald-700" (click)="printInvoice(invoice)">
                    Print Receipt
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
export class BillingInvoicesComponent implements OnInit {
  invoices = signal([
    { id: 'INV-1001', patientName: 'Kamran Khan', date: '2026-08-08', amount: 150.0, status: 'PAID' },
    { id: 'INV-1002', patientName: 'Aarav Patel', date: '2026-08-07', amount: 280.0, status: 'PENDING' },
    { id: 'INV-1003', patientName: 'Ananya Sharma', date: '2026-08-06', amount: 95.0, status: 'PAID' },
    { id: 'INV-1004', patientName: 'Rohan Mehta', date: '2026-08-05', amount: 210.0, status: 'PENDING' },
  ]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}

  printInvoice(invoice: any): void {
    alert(`Printing official receipt for ${invoice.id} (${invoice.patientName}).`);
  }
}
