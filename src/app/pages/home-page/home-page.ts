import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private title = inject(Title);
  private meta = inject(Meta);

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
  }
}
