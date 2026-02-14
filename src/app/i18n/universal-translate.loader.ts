// src/app/i18n/universal-translate.loader.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

export class UniversalTranslateLoader implements TranslateLoader {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<TranslationObject> {
    if (isPlatformServer(this.platformId)) {
      return from(
        (async () => {
          const fs = await import('node:fs/promises');
          const path = await import('node:path');

          // Для SSR/prerender обычно стабильнее читать из src/assets
          const filePath = path.join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content) as TranslationObject;
        })(),
      );
    }

    // Браузер: через HttpClient (важно для Angular CD/zone)
    return this.http.get<TranslationObject>(`assets/i18n/${lang}.json`);
  }
}
