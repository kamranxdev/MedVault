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
import { lucideCreditCard, lucideSend, lucideShieldCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-claims',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideSend,
      lucideShieldCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Insurance Claims Submission & Clearinghouse
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Officer</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Submit 837P electronic claims, review denials, and track payer reimbursements.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Claim ID</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Insurance Carrier</th>
                <th hlmTableHead class="text-xs font-semibold">Claim Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Claim Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Clearinghouse Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let claim of claims()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-foreground">{{ claim.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ claim.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ claim.carrier }}</td>
                <td hlmTableCell class="text-xs font-semibold text-emerald-600">\${{ claim.amount }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="claim.status === 'CLEARED' ? 'default' : 'outline'" class="text-[10px]">
                    {{ claim.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs gap-1.5 text-emerald-600 hover:text-emerald-700" (click)="submitClaim(claim)">
                    <ng-icon name="lucideSend" size="14" />
                    <span>Submit Claim</span>
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
export class BillingClaimsComponent implements OnInit {
  claims = signal([
    { id: 'CLM-901', patientName: 'Kamran Khan', carrier: 'Star Health Insurance', amount: 450.0, status: 'CLEARED' },
    { id: 'CLM-902', patientName: 'Aarav Patel', carrier: 'HDFC ERGO Health', amount: 820.0, status: 'PENDING' },
    { id: 'CLM-903', patientName: 'Ananya Sharma', carrier: 'ICICI Lombard', amount: 310.0, status: 'CLEARED' },
    { id: 'CLM-904', patientName: 'Rohan Mehta', carrier: 'Care Health Insurance', amount: 640.0, status: 'PENDING' },
  ]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}

  submitClaim(claim: any): void {
    claim.status = 'CLEARED';
    alert(`Submitted 837P claim ${claim.id} to ${claim.carrier}.`);
  }
}
