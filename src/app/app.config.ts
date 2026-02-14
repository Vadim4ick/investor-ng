import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  REQUEST,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateService,
} from '@ngx-translate/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { UniversalTranslateLoader } from './i18n/universal-translate.loader';
import { firstValueFrom } from 'rxjs';

function extractLangFromPath(pathname: string | undefined): 'ru' | 'en' {
  if (!pathname) return 'ru';
  const first = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  return first === 'en' ? 'en' : 'ru';
}

function initLocaleFromUrl() {
  const t = inject(TranslateService);
  const req = inject(REQUEST, { optional: true }); // есть только на SSR

  return async () => {
    t.addLangs(['ru', 'en']);
    t.setDefaultLang('ru');

    // SSR -> REQUEST.url, Browser -> location.pathname
    const pathname = req?.url ?? (typeof window !== 'undefined' ? window.location.pathname : '/ru');

    const lang = extractLangFromPath(pathname);

    await firstValueFrom(t.use(lang));

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateLoader(UniversalTranslateLoader),
      fallbackLang: 'ru',
      lang: 'ru',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initLocaleFromUrl,
      multi: true,
    },
  ],
};
