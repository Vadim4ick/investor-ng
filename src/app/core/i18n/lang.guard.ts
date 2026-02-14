// src/app/core/i18n/lang.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

const SUPPORTED = new Set(['ru', 'en']);
type AppLang = 'ru' | 'en';

export const langGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const t = inject(TranslateService);

  const raw = (route.paramMap.get('lang') || '').toLowerCase();
  const lang: AppLang = raw === 'en' ? 'en' : raw === 'ru' ? 'ru' : 'ru';

  if (!SUPPORTED.has(raw)) {
    return router.createUrlTree(['/ru']);
  }

  t.addLangs(['ru', 'en']);
  t.setDefaultLang('ru');

  await firstValueFrom(t.use(lang));

  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }

  return true;
};
