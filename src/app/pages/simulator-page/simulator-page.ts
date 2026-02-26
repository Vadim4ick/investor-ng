import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Hero } from '@/shared/layouts/hero';
import { UbButtonDirective } from '@/shared/ui/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SimulatorCalculation } from '@/modules/simulator-page';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    Hero,
    UbButtonDirective,
    SimulatorCalculation,
  ],
  templateUrl: './simulator-page.html',
})
export class SimulatorPage {
  private title = inject(Title);
  private meta = inject(Meta);
  private t = inject(TranslateService);

  ngOnInit() {
    this.applySeo();
    this.t.onLangChange.subscribe(() => this.applySeo());
  }

  private applySeo() {
    const pageTitle = this.t.instant('seo.simulator.title');
    const pageDesc = this.t.instant('seo.simulator.description');
    const ogTitle = this.t.instant('seo.simulator.ogTitle');
    const ogDesc = this.t.instant('seo.simulator.ogDescription');

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });
    this.meta.updateTag({ property: 'og:title', content: ogTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDesc });

    const lang = this.t.currentLang === 'en' ? 'en_US' : 'ru_RU';
    this.meta.updateTag({ property: 'og:locale', content: lang });
  }
}
