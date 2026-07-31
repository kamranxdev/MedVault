import { Directive } from '@angular/core';
import { BrnDialog } from '@spartan-ng/brain/dialog';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';

@Directive({
  selector: '[hlmDialog],hlm-dialog',
  standalone: true,
  hostDirectives: [BrnDialog],
})
export class HlmDialogDirective {}

const headerVariants = cva('flex flex-col space-y-1.5 text-center sm:text-left');
@Directive({
  selector: '[hlmDialogHeader],hlm-dialog-header',
  standalone: true,
  host: { 'data-slot': 'dialog-header' },
})
export class HlmDialogHeaderDirective {
  constructor() {
    classes(() => headerVariants());
  }
}

const titleVariants = cva('text-lg font-semibold leading-none tracking-tight');
@Directive({
  selector: '[hlmDialogTitle],hlm-dialog-title',
  standalone: true,
  host: { 'data-slot': 'dialog-title' },
})
export class HlmDialogTitleDirective {
  constructor() {
    classes(() => titleVariants());
  }
}

const footerVariants = cva('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
@Directive({
  selector: '[hlmDialogFooter],hlm-dialog-footer',
  standalone: true,
  host: { 'data-slot': 'dialog-footer' },
})
export class HlmDialogFooterDirective {
  constructor() {
    classes(() => footerVariants());
  }
}
