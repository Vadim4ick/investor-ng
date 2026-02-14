import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'home-page-hero',
  imports: [AppContainerComponent, TranslatePipe],
  templateUrl: './hero.html',
})
export class Hero {}
