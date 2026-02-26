import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { langGuard } from './shared/core/i18n/lang.guard';
import { LayoutComponent } from './shared/layouts/main-layout';
import { SimulatorPage } from './pages/simulator-page/simulator-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { Calculation } from './pages/calculation/calculation';

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
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'calculate', component: Calculation },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'ru' },
];
