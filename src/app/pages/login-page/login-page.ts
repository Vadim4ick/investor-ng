import { Component } from '@angular/core';
import { LoginForm } from '@/modules/login-page';
import { AppContainerComponent } from '@/shared/layouts/app-container';

@Component({
  selector: 'login-page',
  imports: [LoginForm, AppContainerComponent],
  templateUrl: './login-page.html',
})
export class LoginPage {}
