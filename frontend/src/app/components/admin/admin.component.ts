import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, AuditLog } from '../../core/models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <div class="header-bar">
        <div>
          <h2>System Administration & Compliance</h2>
          <p class="subtitle">User Account Directory & Security Audit Trail (ROLE_ADMIN Only)</p>
        </div>
      </div>

      <!-- User Accounts Table -->
      <div class="card">
        <h3><i class="ri-user-settings-line"></i> User Account Directory</h3>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Specialization / Dept</th>
                <th>Assigned Roles</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()">
                <td>#{{ u.id }}</td>
                <td><strong>{{ u.username }}</strong></td>
                <td>{{ u.fullName }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.specialization || u.department || 'N/A' }}</td>
                <td>
                  <span *ngFor="let r of u.roles" [class]="getRoleBadge(r)" class="role-tag">
                    {{ r.replace('ROLE_', '') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="card">
        <h3><i class="ri-shield-keyhole-line"></i> HIPAA Compliance Audit Trail</h3>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of auditLogs()">
                <td><span class="log-time">{{ log.timestamp | date:'short' }}</span></td>
                <td><strong>{{ log.username }}</strong></td>
                <td><span class="role-tag badge-admin">{{ log.userRole.replace('ROLE_', '') }}</span></td>
                <td>
                  <span [class]="getActionBadge(log.action)">{{ log.action }}</span>
                </td>
                <td><span class="entity-code">{{ log.entityName }}</span></td>
                <td><span class="log-details">{{ log.details }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .header-bar h2 { font-size: 1.5rem; color: #f8fafc; }
    .subtitle { font-size: 0.85rem; color: #94a3b8; }
    .card h3 { font-size: 1.1rem; color: #f8fafc; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .role-tag { display: inline-block; padding: 0.15rem 0.45rem; font-size: 0.75rem; font-weight: 700; border-radius: 4px; margin-right: 0.25rem; }
    .log-time { font-family: monospace; font-size: 0.8rem; color: #94a3b8; }
    .entity-code { font-family: monospace; font-weight: 700; color: #38bdf8; }
    .log-details { font-size: 0.85rem; color: #cbd5e1; }
    
    .act-create { background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .act-read { background: rgba(2, 132, 199, 0.2); color: #38bdf8; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .act-update { background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .act-login { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
  `]
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  auditLogs = signal<AuditLog[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe(u => this.users.set(u));
    this.apiService.getAuditLogs().subscribe(l => this.auditLogs.set(l));
  }

  getRoleBadge(role: string): string {
    if (role.includes('ADMIN')) return 'badge badge-admin';
    if (role.includes('DOCTOR')) return 'badge badge-doctor';
    if (role.includes('NURSE')) return 'badge badge-nurse';
    return 'badge badge-patient';
  }

  getActionBadge(action: string): string {
    switch (action) {
      case 'CREATE': return 'act-create';
      case 'READ': return 'act-read';
      case 'UPDATE': return 'act-update';
      case 'LOGIN': return 'act-login';
      default: return 'act-read';
    }
  }
}
