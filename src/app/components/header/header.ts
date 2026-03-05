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

import { LangSwitcherComponent } from '@/components/lang-switcher/lang-switcher';
import { ThemeToggleComponent } from '@/components/theme-switcher/theme-switcher';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AppLinkComponent } from '@/shared/ui/app-link';
import { isPlatformBrowser } from '@angular/common';
import { nav } from '@/shared/const/navbar.const';
import { AuthService } from '@/services/auth.service';
import { UbButtonDirective } from '@/shared/ui/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    LangSwitcherComponent,
    ThemeToggleComponent,
    TranslatePipe,
    AppLinkComponent,
    UbButtonDirective,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private router = inject(Router);

  user = toSignal(this.auth.user$, { initialValue: null });

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

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  nav = toSignal(
    this.translate
      .stream(['header.navbar.home', 'header.navbar.simulator', 'header.navbar.calculate'])
      .pipe(map((t) => nav(t))),
    { initialValue: [] },
  );
}
