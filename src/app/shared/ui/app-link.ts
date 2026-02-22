import { Component, Input, OnInit, inject } from '@angular/core';
import { LocaleService } from '@/services/locale.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a
      [routerLink]="[linkPrefix, path]"
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

  // новые инпуты
  @Input() activeClass: string | string[] = '';
  @Input() activeOptions: { exact: boolean } = { exact: false };

  private localeService = inject(LocaleService);
  linkPrefix = '';

  ngOnInit(): void {
    this.linkPrefix = `/${this.localeService.getCurrentLangFromUrl()}`;

    if (this.path.startsWith('/')) {
      this.path = this.path.substring(1);
    }
  }
}
