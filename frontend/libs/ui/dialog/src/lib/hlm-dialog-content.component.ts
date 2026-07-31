import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'hlm-dialog-content',
  standalone: true,
  hostDirectives: [BrnDialogContent],
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'bg-background text-foreground border-border fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg animate-in fade-in-0 zoom-in-95',
  },
})
export class HlmDialogContentComponent {}
