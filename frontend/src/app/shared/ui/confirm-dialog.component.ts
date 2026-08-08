import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideLoader2, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideAlertTriangle, lucideLoader2, lucideX })],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div class="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-foreground relative">
        <button
          type="button"
          (click)="onCancel()"
          class="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm p-1 rounded-md">
          <ng-icon name="lucideX" size="16" />
        </button>

        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <ng-icon name="lucideAlertTriangle" size="20" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground m-0">{{ title }}</h3>
            <p class="text-xs text-muted-foreground m-0 mt-0.5">{{ subtitle }}</p>
          </div>
        </div>

        <div class="text-xs text-muted-foreground py-2 border-y border-border/60">
          <ng-content></ng-content>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button hlmBtn type="button" variant="ghost" size="sm" (click)="onCancel()" [disabled]="loading" class="text-xs h-9">
            {{ cancelText }}
          </button>
          <button
            hlmBtn
            type="button"
            [variant]="confirmVariant"
            size="sm"
            (click)="onConfirm()"
            [disabled]="loading"
            class="text-xs h-9 gap-1.5 font-bold">
            <ng-icon *ngIf="loading" name="lucideLoader2" size="14" class="animate-spin" />
            <span>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() subtitle = 'This action requires confirmation.';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmVariant: 'default' | 'destructive' | 'outline' | 'secondary' = 'destructive';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.loading) this.confirm.emit();
  }

  onCancel(): void {
    if (!this.loading) this.cancel.emit();
  }
}
