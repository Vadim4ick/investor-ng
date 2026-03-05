import { Routes } from '@angular/router';
import { langGuard } from './shared/core/i18n/lang.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ru' },

  {
    path: ':lang',
    canActivate: [langGuard],
    loadComponent: () => import('./shared/layouts/main-layout').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'simulator',
        loadComponent: () =>
          import('./pages/simulator-page/simulator-page').then((m) => m.SimulatorPage),
      },

      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/register-page/register-page').then((m) => m.RegisterPage),
      },

      {
        path: 'calculate',
        loadComponent: () => import('./pages/calculation/calculation').then((m) => m.Calculation),
      },
    ],
  },

  { path: '**', redirectTo: 'ru' },
];
