import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogContentComponent } from './lib/hlm-dialog-content.component';
import {
  HlmDialogDirective,
  HlmDialogFooterDirective,
  HlmDialogHeaderDirective,
  HlmDialogTitleDirective,
} from './lib/hlm-dialog.directives';

export * from './lib/hlm-dialog-content.component';
export * from './lib/hlm-dialog.directives';

export const HlmDialogImports = [
  ...BrnDialogImports,
  HlmDialogDirective,
  HlmDialogContentComponent,
  HlmDialogHeaderDirective,
  HlmDialogTitleDirective,
  HlmDialogFooterDirective,
] as const;
