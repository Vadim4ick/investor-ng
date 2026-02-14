import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private storageKey = 'theme-mode';

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private get root() {
    return this.document.documentElement;
  }

  init() {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;

    if (saved) {
      this.applyTheme(saved);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.applyTheme(prefersDark ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode) {
    if (!this.isBrowser) return;

    this.applyTheme(mode);
    localStorage.setItem(this.storageKey, mode);
  }

  toggle() {
    if (!this.isBrowser) return;

    const isDark = this.root.classList.contains('dark');
    this.setTheme(isDark ? 'light' : 'dark');
  }

  current(): ThemeMode {
    if (!this.isBrowser) return 'light';

    return this.root.classList.contains('dark') ? 'dark' : 'light';
  }

  private applyTheme(mode: ThemeMode) {
    if (mode === 'dark') {
      this.root.classList.add('dark');
    } else {
      this.root.classList.remove('dark');
    }
  }
}
