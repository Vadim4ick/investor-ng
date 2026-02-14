import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ru' | 'en';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private t = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  private readonly STORAGE_KEY = 'app_lang';
  private readonly supported: AppLang[] = ['ru', 'en'];
  private readonly fallback: AppLang = 'ru';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  init(): AppLang {
    // SSR-safe: без localStorage/document на сервере
    const saved = this.isBrowser ? this.getSavedLang() : null;
    const browser = this.isBrowser ? (this.t.getBrowserLang() as AppLang | undefined) : undefined;

    const lang =
      (saved && this.isSupported(saved) && saved) ||
      (browser && this.isSupported(browser) && browser) ||
      this.fallback;

    this.t.addLangs(this.supported);
    this.t.setDefaultLang(this.fallback);
    this.t.use(lang);

    if (this.isBrowser) {
      this.saveLang(lang);
      this.setCookie(lang);
      document.documentElement.lang = lang;
    }

    return lang;
  }

  setLang(lang: AppLang): void {
    if (!this.isSupported(lang)) return;

    this.t.use(lang);

    if (this.isBrowser) {
      this.saveLang(lang);
      this.setCookie(lang);
      document.documentElement.lang = lang;
    }
  }

  getCurrentLang(): AppLang {
    const current = (this.t.currentLang || this.t.getDefaultLang()) as AppLang;
    return this.isSupported(current) ? current : this.fallback;
  }

  getSupported(): AppLang[] {
    return this.supported;
  }

  private isSupported(lang: string): lang is AppLang {
    return this.supported.includes(lang as AppLang);
  }

  private getSavedLang(): AppLang | null {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY);
      return v && this.isSupported(v) ? v : null;
    } catch {
      return null;
    }
  }

  private saveLang(lang: AppLang): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {}
  }

  private setCookie(lang: AppLang): void {
    // сюда попадём только в браузере
    document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
  }
}
