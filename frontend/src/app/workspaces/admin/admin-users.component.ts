import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/models';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucidePlus, lucideShieldCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideUsers, lucidePlus, lucideShieldCheck })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            User RBAC Management
            <span hlmBadge variant="secondary" class="text-[10px]">System Admin</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Provision staff credentials, role assignments, and licenses.</p>
        </div>
        <button hlmBtn variant="default" size="sm" (click)="showCreateUserModal.set(true)" class="gap-1.5 font-semibold text-xs">
          <ng-icon name="lucidePlus" size="14" /> Create Staff User
        </button>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Full Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">Username</th>
                <th hlmTableHead class="py-3 px-4 text-left">Email</th>
                <th hlmTableHead class="py-3 px-4 text-left">Assigned Roles</th>
                <th hlmTableHead class="py-3 px-4 text-left">Department / Specialization</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let u of users()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ u.fullName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ u.username }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ u.email }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span *ngFor="let r of u.roles" hlmBadge variant="outline" class="text-[10px] mr-1">{{ r }}</span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ u.department || u.specialization || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  showCreateUserModal = signal(false);

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe((u) => this.users.set(u));
  }
}
