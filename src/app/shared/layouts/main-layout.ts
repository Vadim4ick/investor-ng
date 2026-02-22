import { Component } from '@angular/core';
import { Footer } from '@/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@/components/header/header';

@Component({
  selector: 'app-layout',
  template: `
    <div class="min-h-screen bg-background text-foreground">
      <app-header />

      <main>
        <router-outlet></router-outlet>
      </main>

      <app-footer />
    </div>
  `,
  imports: [Footer, RouterOutlet, HeaderComponent],
})
export class LayoutComponent {}
