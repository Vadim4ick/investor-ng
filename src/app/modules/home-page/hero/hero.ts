import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLinkComponent } from '@/shared/ui/app-link';
import { Hero as HeroLayout } from '@/shared/layouts/hero';

@Component({
  selector: 'home-page-hero',
  imports: [TranslatePipe, AppLinkComponent, HeroLayout],
  templateUrl: './hero.html',
})
export class Hero {}
