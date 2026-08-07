import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogContent } from './lib/hlm-dialog-content.component';
import {
  HlmDialog,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from './lib/hlm-dialog.directives';

export * from './lib/hlm-dialog-content.component';
export * from './lib/hlm-dialog.directives';

export const HlmDialogImports = [
  ...BrnDialogImports,
  HlmDialog,
  HlmDialogContent,
  HlmDialogHeader,
  HlmDialogTitle,
  HlmDialogFooter,
] as const;
