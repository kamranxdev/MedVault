import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'medvault-theme';

/**
 * Drives the spartan/ui `.dark` class on <html>.
 * Persists the user's choice; falls back to OS preference on first visit.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.resolveInitialMode());

  constructor() {
    effect(() => this.applyToDocument(this.mode()));
  }

  toggle(): void {
    this.mode.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private resolveInitialMode(): ThemeMode {
    if (typeof window === 'undefined') return 'light';

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyToDocument(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle('dark', mode === 'dark');
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}
