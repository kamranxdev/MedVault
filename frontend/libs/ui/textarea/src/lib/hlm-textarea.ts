import { Directive, input, signal } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-20 w-full rounded-md border bg-input/40 px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px]',
  {
    variants: {
      error: {
        true: 'border-destructive focus-visible:ring-destructive/20',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;

@Directive({
  selector: '[hlmTextarea]',
  host: {
    'data-slot': 'textarea',
  },
})
export class HlmTextarea {
  private readonly _additionalClasses = signal<ClassValue>('');
  public readonly error = input<TextareaVariants['error']>(false);

  constructor() {
    classes(() => [textareaVariants({ error: this.error() }), this._additionalClasses()]);
  }

  setClass(classes: string): void {
    this._additionalClasses.set(classes);
  }
}
