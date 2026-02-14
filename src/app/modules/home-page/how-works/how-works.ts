import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';

@Component({
  selector: 'home-page-how-works',
  imports: [TranslatePipe, AppContainerComponent],
  templateUrl: './how-works.html',
})
export class HowWorks {}
