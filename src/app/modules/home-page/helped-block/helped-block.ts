import { AppContainerComponent } from '@/shared/layouts/app-container';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'home-page-helped-block',
  imports: [AppContainerComponent, TranslatePipe],
  templateUrl: './helped-block.html',
})
export class HelpedBlock {}
