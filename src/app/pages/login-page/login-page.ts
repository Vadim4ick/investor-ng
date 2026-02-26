import { Component, inject } from '@angular/core';
import { LoginForm } from '@/modules/login-page';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'login-page',
  imports: [LoginForm, AppContainerComponent],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private title = inject(Title);
  private meta = inject(Meta);
  private t = inject(TranslateService);

  ngOnInit() {
    this.applySeo();
    this.t.onLangChange.subscribe(() => this.applySeo());
  }

  private applySeo() {
    const pageTitle = this.t.instant('seo.authorization.title');
    const pageDesc = this.t.instant('seo.authorization.description');
    const ogTitle = this.t.instant('seo.authorization.ogTitle');
    const ogDesc = this.t.instant('seo.authorization.ogDescription');

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });
    this.meta.updateTag({ property: 'og:title', content: ogTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDesc });

    const lang = this.t.currentLang === 'en' ? 'en_US' : 'ru_RU';
    this.meta.updateTag({ property: 'og:locale', content: lang });
  }
}
