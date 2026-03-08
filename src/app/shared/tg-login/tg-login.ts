import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@/services/auth.service';
import { Router } from '@angular/router';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthUser) => void;
  }
}

export type TelegramAuthUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

@Component({
  selector: 'tg-login',
  standalone: true,
  template: `<div #telegramContainer></div>`,
})
export class TgLoginComponent implements AfterViewInit {
  @ViewChild('telegramContainer', { static: true })
  container!: ElementRef<HTMLDivElement>;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    window.onTelegramAuth = async (user: TelegramAuthUser) => {
      this.authService.telegramAuth(user).subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.error(err);
        },
      });
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'invetor_ng_bot'); // username бота без @
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    this.container.nativeElement.innerHTML = '';
    this.container.nativeElement.appendChild(script);
  }
}
