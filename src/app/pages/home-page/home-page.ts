import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LangSwitcherComponent } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'home-page',
  imports: [RouterLink, TranslatePipe, LangSwitcherComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private title = inject(Title);
  private meta = inject(Meta);

  private t = inject(TranslateService);

  constructor() {
    this.title.setTitle('Симулятор инвестора — узнай, выйдешь ли на капитал к 40');

    this.meta.addTags([
      {
        name: 'description',
        content:
          'Интерактивный симулятор финансовой грамотности. Узнай, сколько капитала ты накопишь за 20 лет.',
      },
      {
        property: 'og:title',
        content: 'Симулятор инвестора',
      },
      {
        property: 'og:description',
        content: 'Запусти симуляцию жизни на 20 лет и узнай свой капитал.',
      },
    ]);

    this.t.addLangs(['ru', 'en']);
    this.t.setDefaultLang('ru');
    this.t.use('ru');
  }
}
