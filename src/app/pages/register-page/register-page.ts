import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { LoginForm } from '@/modules/login-page';

@Component({
  selector: 'register-page',
  imports: [AppContainerComponent, LoginForm],
  templateUrl: './register-page.html',
})
export class RegisterPage {}
