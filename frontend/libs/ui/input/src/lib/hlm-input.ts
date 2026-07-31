import { Directive, input, signal } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputVariants = cva(
  'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full rounded-md border bg-input/40 px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px]',
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

export type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: '[hlmInput]',
  host: {
    'data-slot': 'input',
  },
})
export class HlmInput {
  private readonly _additionalClasses = signal<ClassValue>('');
  public readonly error = input<InputVariants['error']>(false);

  constructor() {
    classes(() => [inputVariants({ error: this.error() }), this._additionalClasses()]);
  }

  setClass(classes: string): void {
    this._additionalClasses.set(classes);
  }
}
