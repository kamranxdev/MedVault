import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, AuditLog } from '../../core/models/models';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, CardModule, DialogModule, MessageModule, InputTextModule, SelectModule],
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

  getRoleBadge(role: string): string {
    if (role.includes('ADMIN')) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    if (role.includes('DOCTOR')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (role.includes('NURSE')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (role.includes('AUDITOR')) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  }
}
