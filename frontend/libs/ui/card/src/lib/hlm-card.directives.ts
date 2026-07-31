import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';

const cardVariants = cva('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm');
@Directive({
  selector: '[hlmCard],hlm-card',
  host: { 'data-slot': 'card' },
})
export class HlmCardDirective {
  constructor() {
    classes(() => cardVariants());
  }
}

const cardHeaderVariants = cva('flex flex-col gap-1.5 px-6');
@Directive({
  selector: '[hlmCardHeader],hlm-card-header',
  host: { 'data-slot': 'card-header' },
})
export class HlmCardHeaderDirective {
  constructor() {
    classes(() => cardHeaderVariants());
  }
}

const cardTitleVariants = cva('font-semibold leading-none tracking-tight text-lg');
@Directive({
  selector: '[hlmCardTitle],hlm-card-title',
  host: { 'data-slot': 'card-title' },
})
export class HlmCardTitleDirective {
  constructor() {
    classes(() => cardTitleVariants());
  }
}

const cardDescriptionVariants = cva('text-muted-foreground text-sm');
@Directive({
  selector: '[hlmCardDescription],hlm-card-description',
  host: { 'data-slot': 'card-description' },
})
export class HlmCardDescriptionDirective {
  constructor() {
    classes(() => cardDescriptionVariants());
  }
}

const cardContentVariants = cva('px-6');
@Directive({
  selector: '[hlmCardContent],hlm-card-content',
  host: { 'data-slot': 'card-content' },
})
export class HlmCardContentDirective {
  constructor() {
    classes(() => cardContentVariants());
  }
}

const cardFooterVariants = cva('flex items-center px-6');
@Directive({
  selector: '[hlmCardFooter],hlm-card-footer',
  host: { 'data-slot': 'card-footer' },
})
export class HlmCardFooterDirective {
  constructor() {
    classes(() => cardFooterVariants());
  }
}
