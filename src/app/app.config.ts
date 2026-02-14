import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateService,
} from '@ngx-translate/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { UniversalTranslateLoader } from './i18n/universal-translate.loader';
import { LocaleService } from './core/locale.service';
import { firstValueFrom } from 'rxjs';

function initLocale() {
  const locale = inject(LocaleService);
  const t = inject(TranslateService);

  return async () => {
    const lang = locale.init(); // только вычисляет язык
    await firstValueFrom(t.use(lang)); // единственный use()
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
      useFactory: initLocale,
      multi: true,
    },
  ],
};
