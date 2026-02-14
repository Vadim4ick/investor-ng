import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'home-page-cta',
  imports: [AppContainerComponent, TranslatePipe],
  templateUrl: './cta.html',
})
export class Cta {}
