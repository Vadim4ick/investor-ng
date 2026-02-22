import { Component, Input, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocaleService } from '@/services/locale.service';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a
      [routerLink]="routerLink()"
      [routerLinkActive]="activeClass"
      [routerLinkActiveOptions]="activeOptions"
      [ngClass]="classList"
      [innerHTML]="label"
      class="inline-flex items-center justify-center transition"
    ></a>
  `,
})
export class AppLinkComponent implements OnInit {
  @Input() path = '';
  @Input() label = '';
  @Input() classList = '';
  @Input() activeClass: string | string[] = '';
  @Input() activeOptions: { exact: boolean } = { exact: false };

  private localeService = inject(LocaleService);

  private lang = 'ru'; // локальная строка для линка

  constructor() {
    effect(() => {
      this.lang = this.localeService.lang();
    });
  }

  ngOnInit(): void {
    if (this.path.startsWith('/')) {
      this.path = this.path.substring(1);
    }
  }

  routerLink() {
    // если path пустой — просто /:lang
    return this.path ? ['/', this.lang, this.path] : ['/', this.lang];
  }
}
