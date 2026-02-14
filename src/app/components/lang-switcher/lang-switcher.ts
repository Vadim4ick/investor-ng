import { Component, inject } from '@angular/core';
import { LocaleService, AppLang } from '../../core/locale.service';

@Component({
  selector: 'lang-switcher',
  standalone: true,
  templateUrl: './lang-switcher.html',
})
export class LangSwitcherComponent {
  private locale = inject(LocaleService);

  langs = this.locale.getSupported();

  get current(): AppLang {
    return this.locale.getCurrentLangFromUrl();
  }

  async switchLang(lang: AppLang) {
    await this.locale.setLang(lang);
  }
}
