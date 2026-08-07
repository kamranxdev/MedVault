import {
  HlmTableBody,
  HlmTableCell,
  HlmTable,
  HlmTableHead,
  HlmTableHeader,
  HlmTableRow,
} from './lib/hlm-table.directives';

export * from './lib/hlm-table.directives';

export const HlmTableImports = [
  HlmTable,
  HlmTableHeader,
  HlmTableBody,
  HlmTableRow,
  HlmTableHead,
  HlmTableCell,
] as const;
