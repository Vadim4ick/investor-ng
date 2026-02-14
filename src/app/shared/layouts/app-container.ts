import { Component } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  template: `
    <div class="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <ng-content />
    </div>
  `,
})
export class AppContainerComponent {}
