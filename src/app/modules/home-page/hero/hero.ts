import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLinkComponent } from '@/shared/ui/app-link';

@Component({
  selector: 'home-page-hero',
  imports: [AppContainerComponent, TranslatePipe, AppLinkComponent],
  templateUrl: './hero.html',
})
export class Hero {}
