import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LangSwitcherComponent } from '@/components/lang-switcher/lang-switcher';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { ThemeToggleComponent } from '@/components/theme-switcher/theme-switcher';

@Component({
  selector: 'home-page',
  standalone: true,
  templateUrl: './home-page.html',
  imports: [LangSwitcherComponent, TranslatePipe, AppContainerComponent, ThemeToggleComponent],
})
export class HomePage {
  private title = inject(Title);
  private meta = inject(Meta);
  private t = inject(TranslateService);

  ngOnInit() {
    this.applySeo();
    this.t.onLangChange.subscribe(() => this.applySeo());
  }

  private applySeo() {
    const pageTitle = this.t.instant('seo.home.title');
    const pageDesc = this.t.instant('seo.home.description');
    const ogTitle = this.t.instant('seo.home.ogTitle');
    const ogDesc = this.t.instant('seo.home.ogDescription');

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });
    this.meta.updateTag({ property: 'og:title', content: ogTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDesc });

    const lang = this.t.currentLang === 'en' ? 'en_US' : 'ru_RU';
    this.meta.updateTag({ property: 'og:locale', content: lang });
  }
}
