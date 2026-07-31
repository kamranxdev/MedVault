import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';

const tabsListVariants = cva(
  'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground'
);

@Directive({
  selector: '[hlmTabsList],hlm-tabs-list',
  standalone: true,
  host: { 'data-slot': 'tabs-list' },
})
export class HlmTabsListDirective {
  constructor() {
    classes(() => tabsListVariants());
  }
}

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
);

@Directive({
  selector: '[hlmTabsTrigger],hlm-tabs-trigger',
  standalone: true,
  host: { 'data-slot': 'tabs-trigger' },
})
export class HlmTabsTriggerDirective {
  constructor() {
    classes(() => tabsTriggerVariants());
  }
}

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
);

@Directive({
  selector: '[hlmTabsContent],hlm-tabs-content',
  standalone: true,
  host: { 'data-slot': 'tabs-content' },
})
export class HlmTabsContentDirective {
  constructor() {
    classes(() => tabsContentVariants());
  }
}
