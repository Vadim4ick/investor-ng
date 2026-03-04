import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '@/services/auth.service';

export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const lang = route.paramMap.get('lang') ?? 'ru';

  return auth.user$.pipe(
    take(1),
    map((user) => (user ? router.createUrlTree(['/', lang]) : true)),
  );
};
