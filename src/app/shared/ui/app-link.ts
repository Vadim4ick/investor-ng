import { Component, Input, OnInit, inject } from '@angular/core';
import { LocaleService } from '@/shared/core/locale.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <a
      [routerLink]="[linkPrefix, path]"
      [ngClass]="classList"
      [innerHTML]="label"
      class="inline-flex items-center justify-center transition"
    >
    </a>
  `,
})
export class AppLinkComponent implements OnInit {
  @Input() path: string = ''; // Путь к странице
  @Input() label: string = ''; // Текст ссылки
  @Input() classList: string = ''; // Дополнительные классы для стилизации

  private localeService = inject(LocaleService);
  linkPrefix: string = '';

  ngOnInit(): void {
    this.linkPrefix = `/${this.localeService.getCurrentLangFromUrl()}`;

    if (this.path.startsWith('/')) {
      this.path = this.path.substring(1); // Убираем начальный слэш
    }
  }
}
