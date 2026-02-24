import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  PLATFORM_ID,
  REQUEST,
  LOCALE_ID,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateService,
} from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { UniversalTranslateLoader } from './shared/core/i18n/universal-translate.loader';

function extractLang(path?: string): 'ru' | 'en' {
  const first = (path || '').split('/').filter(Boolean)[0]?.toLowerCase();
  return first === 'en' ? 'en' : 'ru';
}

function initLocale() {
  const t = inject(TranslateService);
  const req = inject(REQUEST, { optional: true });
  const platformId = inject(PLATFORM_ID);

  return async () => {
    t.addLangs(['ru', 'en']);
    t.setDefaultLang('ru');

    const path = isPlatformServer(platformId) ? (req?.url ?? '/ru') : window.location.pathname;

    const lang = extractLang(path);

    await firstValueFrom(t.use(lang));

    if (!isPlatformServer(platformId)) {
      document.documentElement.lang = lang;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'ru-RU' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateLoader(UniversalTranslateLoader),
      fallbackLang: 'ru',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initLocale,
      multi: true,
    },
  ],
};
