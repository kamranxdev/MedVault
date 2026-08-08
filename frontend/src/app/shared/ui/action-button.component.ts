import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideLoader2 })],
  template: `
    <button
      hlmBtn
      [type]="type"
      [variant]="variant"
      [size]="size"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [class]="customClass">
      <ng-icon *ngIf="loading" name="lucideLoader2" size="14" class="animate-spin mr-1.5 inline-block" />
      <ng-content></ng-content>
    </button>
  `,
})
export class ActionButtonComponent {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' | 'xs' = 'default';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClass = '';

  @Output() action = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (this.loading || this.disabled) return;
    this.action.emit(event);
  }
}
