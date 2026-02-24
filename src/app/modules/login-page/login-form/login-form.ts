import { Component, Input, signal } from '@angular/core';
import { UbInputDirective } from '@/shared/ui/input';
import { UbButtonDirective } from '@/shared/ui/button';
import { AppLinkComponent } from '@/shared/ui/app-link';
import { TranslatePipe } from '@ngx-translate/core';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'login-form',
  imports: [UbInputDirective, UbButtonDirective, AppLinkComponent, TranslatePipe],
  templateUrl: './login-form.html',
})
export class LoginForm {
  @Input() authMode: AuthMode = 'login';

  onSubmit(e: Event) {
    e.preventDefault();
  }

  loginWithTelegram() {
    // redirect to your backend OAuth endpoint
    window.location.href = '/api/auth/telegram';
  }
}
