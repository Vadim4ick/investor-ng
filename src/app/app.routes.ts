import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { langGuard } from './shared/core/i18n/lang.guard';
import { LayoutComponent } from './shared/layouts/main-layout';
import { SimulatorPage } from './pages/simulator-page/simulator-page';

export const routes: Routes = [
  // редирект с корня на ru (можно сменить на en)
  { path: '', pathMatch: 'full', redirectTo: 'ru' },

  {
    path: ':lang',
    canActivate: [langGuard],
    component: LayoutComponent,
    children: [
      { path: '', component: HomePage },
      { path: 'simulator', component: SimulatorPage },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'ru' },
];
