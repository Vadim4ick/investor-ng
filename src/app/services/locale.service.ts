import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ru' | 'en';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private t = inject(TranslateService);
  private router = inject(Router);

  private readonly supported: AppLang[] = ['ru', 'en'];

  lang = signal<AppLang>(this.getCurrentLangFromUrl());

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.lang.set(this.getCurrentLangFromUrl());
      });
  }

  getSupported(): AppLang[] {
    return this.supported;
  }

  getCurrentLangFromUrl(): AppLang {
    const first = this.router.url.split('/').filter(Boolean)[0]?.toLowerCase();
    return first === 'en' ? 'en' : 'ru';
  }

  async setLang(lang: AppLang): Promise<void> {
    this.t.use(lang);

    const segments = this.router.url.split('/').filter(Boolean);
    if (segments.length === 0) {
      await this.router.navigate(['/', lang]);
      return;
    }

    segments[0] = lang;
    await this.router.navigate(['/', ...segments], { replaceUrl: true });

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // опционально: можно сразу обновить signal, не дожидаясь NavigationEnd
    this.lang.set(lang);
  }
}
