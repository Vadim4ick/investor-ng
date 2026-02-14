import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('investor-ng');

  constructor(private theme: ThemeService) {
    this.theme.init();
  }
}
