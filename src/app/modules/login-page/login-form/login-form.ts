import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { UbInputDirective } from '@/shared/ui/input';
import { UbButtonDirective } from '@/shared/ui/button';
import { AppLinkComponent } from '@/shared/ui/app-link';
import { TranslatePipe } from '@ngx-translate/core';

import { LoginFormFacade, AuthMode } from './login-form.facade';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UbInputDirective,
    UbButtonDirective,
    AppLinkComponent,
    TranslatePipe,
  ],
  templateUrl: './login-form.html',
  providers: [LoginFormFacade], // важный момент: фасад = scoped per component instance
})
export class LoginForm implements OnChanges {
  @Input() authMode: AuthMode = 'login';

  constructor(public vm: LoginFormFacade) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['authMode']) {
      this.vm.setMode(this.authMode);
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.vm.submit(this.authMode);
  }

  loginWithTelegram() {
    window.location.href = '/api/auth/telegram';
  }
}
