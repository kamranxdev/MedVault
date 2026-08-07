import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmTabsContent, HlmTabsList, HlmTabsTrigger } from './lib/hlm-tabs.directives';

export * from './lib/hlm-tabs.directives';

export const HlmTabsImports = [
  ...BrnTabsImports,
  HlmTabsList,
  HlmTabsTrigger,
  HlmTabsContent,
] as const;
