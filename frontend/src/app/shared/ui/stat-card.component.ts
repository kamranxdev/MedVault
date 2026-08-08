import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  template: `
    <div class="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-xs">
      <div class="space-y-1">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ title }}</span>
        <div class="text-2xl font-bold text-foreground font-mono" [ngClass]="valueClass">{{ value }}</div>
        <span class="text-[10px]" [ngClass]="subtitleClass">{{ subtitle }}</span>
      </div>
      <div class="size-10 rounded-lg flex items-center justify-center shrink-0" [ngClass]="iconBgClass">
        <ng-icon [name]="icon" size="20" />
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() subtitle = '';
  @Input() icon = 'lucideActivity';
  @Input() iconBgClass = 'bg-primary/10 text-primary';
  @Input() valueClass = 'text-foreground';
  @Input() subtitleClass = 'text-muted-foreground';
}
