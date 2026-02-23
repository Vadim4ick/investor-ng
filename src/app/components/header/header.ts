import {
  Component,
  DOCUMENT,
  effect,
  HostListener,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LangSwitcherComponent } from '@/components/lang-switcher/lang-switcher';
import { ThemeToggleComponent } from '@/components/theme-switcher/theme-switcher';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AppLinkComponent } from '@/shared/ui/app-link';
import { isPlatformBrowser } from '@angular/common';

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
  styleUrl: './header.css',
})
export class HeaderComponent {
  private translate = inject(TranslateService);

  mobileMenuOpen = signal(false);

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      if (!this.isBrowser) return;

      const open = this.mobileMenuOpen();
      this.doc.body.style.overflow = open ? 'hidden' : '';
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeMobileMenu();
  }

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
