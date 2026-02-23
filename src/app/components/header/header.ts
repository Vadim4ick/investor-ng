import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LangSwitcherComponent } from '@/components/lang-switcher/lang-switcher';
import { ThemeToggleComponent } from '@/components/theme-switcher/theme-switcher';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AppLinkComponent } from '@/shared/ui/app-link';

type NavItem = { path: string; label: string; exact?: boolean };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    LangSwitcherComponent,
    ThemeToggleComponent,
    TranslatePipe,
    AppLinkComponent,
  ],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private translate = inject(TranslateService);

  mobileMenuOpen = signal(false);

  nav = toSignal(
    this.translate.stream(['header.navbar.home', 'header.navbar.simulator']).pipe(
      map(
        (t) =>
          [
            { path: '/', label: t['header.navbar.home'], exact: true },
            { path: '/simulator', label: t['header.navbar.simulator'] },
          ] satisfies NavItem[],
      ),
    ),
    { initialValue: [] },
  );
}
