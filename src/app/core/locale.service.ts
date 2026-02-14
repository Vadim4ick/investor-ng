import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ru' | 'en';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private t = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly supported: AppLang[] = ['ru', 'en'];

  getSupported(): AppLang[] {
    return this.supported;
  }

  getCurrentLangFromUrl(): AppLang {
    const first = this.router.url.split('/').filter(Boolean)[0]?.toLowerCase();
    return first === 'en' ? 'en' : 'ru';
  }

  async setLang(lang: AppLang): Promise<void> {
    // 1) переключаем translate
    this.t.use(lang);

    // 2) меняем только первый сегмент URL
    const segments = this.router.url.split('/').filter(Boolean);
    if (segments.length === 0) {
      await this.router.navigate(['/', lang]);
      return;
    }

    segments[0] = lang; // заменяем :lang
    await this.router.navigate(['/', ...segments], { replaceUrl: true });

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }
}
