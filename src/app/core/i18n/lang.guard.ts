import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const SUPPORTED = new Set(['ru', 'en']);

export const langGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const lang = (route.paramMap.get('lang') || '').toLowerCase();

  if (!SUPPORTED.has(lang)) {
    // если язык неверный -> уводим на ru
    return router.createUrlTree(['/ru']);
  }

  return true;
};
