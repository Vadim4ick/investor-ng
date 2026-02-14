import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomePage],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('investor-ng');
}
