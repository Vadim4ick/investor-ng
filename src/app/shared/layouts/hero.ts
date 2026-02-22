import { Component } from '@angular/core';
import { AppContainerComponent } from './app-container';

@Component({
  selector: 'app-hero',
  imports: [AppContainerComponent],
  template: `<section class="h-screen bg-linear-to-b from-background to-muted/40">
    <app-container class="h-full flex-col flex items-center justify-center">
      <ng-content />
    </app-container>
  </section>`,
})
export class Hero {}
