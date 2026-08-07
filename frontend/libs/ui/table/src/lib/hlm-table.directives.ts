import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';

const tableVariants = cva('w-full caption-bottom text-sm border-collapse');
@Directive({
  selector: '[hlmTable],table[hlmTable]',
  host: { 'data-slot': 'table' },
})
export class HlmTable {
  constructor() {
    classes(() => tableVariants());
  }
}

const headerVariants = cva('[&_tr]:border-b');
@Directive({
  selector: '[hlmTableHeader],thead[hlmTableHeader]',
  host: { 'data-slot': 'table-header' },
})
export class HlmTableHeader {
  constructor() {
    classes(() => headerVariants());
  }
}

const bodyVariants = cva('[&_tr:last-child]:border-0');
@Directive({
  selector: '[hlmTableBody],tbody[hlmTableBody]',
  host: { 'data-slot': 'table-body' },
})
export class HlmTableBody {
  constructor() {
    classes(() => bodyVariants());
  }
}

const trVariants = cva(
  'border-b border-border/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
);
@Directive({
  selector: '[hlmTableRow],tr[hlmTableRow]',
  host: { 'data-slot': 'table-row' },
})
export class HlmTableRow {
  constructor() {
    classes(() => trVariants());
  }
}

const thVariants = cva(
  'h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
);
@Directive({
  selector: '[hlmTableHead],th[hlmTableHead]',
  host: { 'data-slot': 'table-head' },
})
export class HlmTableHead {
  constructor() {
    classes(() => thVariants());
  }
}

const tdVariants = cva(
  'p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
);
@Directive({
  selector: '[hlmTableCell],td[hlmTableCell]',
  host: { 'data-slot': 'table-cell' },
})
export class HlmTableCell {
  constructor() {
    classes(() => tdVariants());
  }
}
