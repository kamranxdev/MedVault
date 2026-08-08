import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Allergy } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-allergies',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports],
  providers: [provideIcons({ lucideTriangleAlert })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            My Allergies & Medical Safety Record
            <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">View your documented drug, food, and environmental allergies.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Allergen</th>
                <th hlmTableHead class="py-3 px-4 text-left">Category</th>
                <th hlmTableHead class="py-3 px-4 text-left">Severity</th>
                <th hlmTableHead class="py-3 px-4 text-left">Reaction Description</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let a of allergies()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ a.allergenName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.category }}</td>
                <td hlmTableCell class="py-3 px-4"><span hlmBadge [variant]="a.severity === 'SEVERE' ? 'destructive' : 'secondary'" class="text-[10px]">{{ a.severity }}</span></td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.reactionDescription }}</td>
              </tr>
              <tr *ngIf="allergies().length === 0" hlmTableRow>
                <td colspan="4" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No allergies documented.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PatientAllergiesComponent implements OnInit {
  allergies = signal<Allergy[]>([]);

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.currentUser();
    if (u) {
      this.apiService.getPatientByUserId(u.userId).subscribe((p) => {
        if (p) this.apiService.getAllergiesByPatient(p.id).subscribe((a) => this.allergies.set(a));
      });
    }
  }
}
