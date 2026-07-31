import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import {
  HlmTabsContentDirective,
  HlmTabsListDirective,
  HlmTabsTriggerDirective,
} from './lib/hlm-tabs.directives';

export * from './lib/hlm-tabs.directives';

export const HlmTabsImports = [
  ...BrnTabsImports,
  HlmTabsListDirective,
  HlmTabsTriggerDirective,
  HlmTabsContentDirective,
] as const;
