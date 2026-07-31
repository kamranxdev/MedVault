import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, AuditLog } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideUserCheck, lucideShieldCheck, lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon
  ],
  providers: [
    provideIcons({ lucideSettings, lucideUserCheck, lucideShieldCheck, lucideUsers })
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
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
}
