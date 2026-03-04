import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('investor-ng');
  private auth = inject(AuthService);

  status = toSignal(this.auth.status$, { initialValue: 'loading' });

  constructor(private theme: ThemeService) {
    this.theme.init();
    this.auth.initSession().subscribe();
  }
}
