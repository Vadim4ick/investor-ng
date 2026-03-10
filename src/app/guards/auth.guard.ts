import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { combineLatest, filter, map, take } from 'rxjs';
import { AuthService } from '@/services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const lang = route.paramMap.get('lang') ?? 'ru';

  // На сервере всегда пропускаем — реальная проверка будет в браузере
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return combineLatest([auth.status$, auth.user$]).pipe(
    filter(([status]) => status === 'ready'),
    take(1),
    map(([, user]) => (user ? true : router.createUrlTree(['/', lang]))),
  );
};
