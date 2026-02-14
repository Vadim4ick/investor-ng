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
  current = this.locale.getCurrentLang();

  switchLang(lang: AppLang) {
    this.locale.setLang(lang);
    this.current = lang;
  }
}
