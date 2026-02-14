import { Component } from '@angular/core';
import { ThemeService } from '@/services/theme.service';

@Component({
  selector: 'theme-toggle',
  standalone: true,
  templateUrl: './theme-switcher.html',
})
export class ThemeToggleComponent {
  constructor(private theme: ThemeService) {}

  get isDark() {
    return this.theme.current() === 'dark';
  }

  toggle() {
    this.theme.toggle();
  }
}
