import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Injectable, inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ru' | 'en';
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private t = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  private request = inject(REQUEST, { optional: true });

  private readonly STORAGE_KEY = 'app_lang';
  private readonly COOKIE_KEY = 'lang';
  private readonly fallback: AppLang = 'ru';
  private readonly supported: AppLang[] = ['ru', 'en'];

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  /** Только определяет язык + базовая конфигурация, без t.use() */
  init(): AppLang {
    this.t.addLangs(this.supported);
    this.t.setDefaultLang(this.fallback);

    const fromStorage = this.isBrowser ? this.getFromLocalStorage() : null;
    const fromCookie = this.getFromCookie();
    const fromBrowser = this.isBrowser ? this.t.getBrowserLang() : null;

    const lang =
      this.normalize(fromStorage) ??
      this.normalize(fromCookie) ??
      this.normalize(fromBrowser) ??
      this.fallback;

    // синхронизируем хранилища (только браузер)
    if (this.isBrowser) {
      this.persist(lang);
      this.doc.documentElement.lang = lang;
    }

    return lang;
  }

  setLang(lang: AppLang) {
    const normalized = this.normalize(lang) ?? this.fallback;
    this.t.use(normalized);
    if (this.isBrowser) {
      this.persist(normalized);
      this.doc.documentElement.lang = normalized;
    }
  }

  getSupported(): AppLang[] {
    return this.supported;
  }

  getCurrentLang(): AppLang {
    return (this.normalize(this.t.currentLang) ?? this.fallback) as AppLang;
  }

  private persist(lang: AppLang) {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {}
    this.doc.cookie = `${this.COOKIE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
  }

  private getFromLocalStorage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private getFromCookie(): string | null {
    // Browser
    if (this.isBrowser) {
      const m = this.doc.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }

    // Server (SSR)
    const cookieHeader = this.request?.headers?.get('cookie') ?? '';
    const m = cookieHeader.match(/(?:^|;\s*)lang=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  private normalize(v: string | null | undefined): AppLang | null {
    if (!v) return null;
    const short = v.toLowerCase().split('-')[0];
    return this.supported.includes(short as AppLang) ? (short as AppLang) : null;
  }
}
