import { Component } from '@angular/core';
import { LangSwitcherComponent } from '@/components/lang-switcher/lang-switcher';
import { ThemeToggleComponent } from '@/components/theme-switcher/theme-switcher';
import { Footer } from '@/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  template: `
    <div class="min-h-screen bg-background text-foreground">
      <lang-switcher />
      <theme-toggle />

      <main>
        <router-outlet></router-outlet>
      </main>

      <app-footer />
    </div>
  `,
  imports: [LangSwitcherComponent, ThemeToggleComponent, Footer, RouterOutlet],
})
export class LayoutComponent {}
