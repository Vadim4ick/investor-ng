import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLinkComponent } from '@/shared/ui/app-link';

@Component({
  selector: 'home-page-cta',
  imports: [AppContainerComponent, TranslatePipe, AppLinkComponent],
  templateUrl: './cta.html',
})
export class Cta {}
