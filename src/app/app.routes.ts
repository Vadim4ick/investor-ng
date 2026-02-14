import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { langGuard } from './shared/core/i18n/lang.guard';

export const routes: Routes = [
  // редирект с корня на ru (можно сменить на en)
  { path: '', pathMatch: 'full', redirectTo: 'ru' },

  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      { path: '', component: HomePage },

      // пример внутренних страниц
      // { path: 'about', component: AboutPage },
      // { path: 'pricing', component: PricingPage },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'ru' },
];
