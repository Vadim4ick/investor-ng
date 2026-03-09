import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '@/services/auth.service';
import { passwordMatchValidator } from './validators';
import { extractErrorMessage } from './error-message';
import { map } from 'rxjs';

export type AuthMode = 'login' | 'register';

export class LoginFormFacade {
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  serverError = signal<string | null>(null);

  form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', { nonNullable: true }),
      acceptTerms: new FormControl(false, { nonNullable: true }),
    },
    { validators: [passwordMatchValidator] },
  );

  // геттеры (типизированнее и удобнее)
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }
  get acceptTerms() {
    return this.form.controls.acceptTerms;
  }

  setMode(mode: AuthMode) {
    // включаем/выключаем валидаторы под режим
    if (mode === 'register') {
      this.confirmPassword.setValidators([Validators.required, Validators.minLength(6)]);
      this.acceptTerms.setValidators([Validators.requiredTrue]);
    } else {
      this.confirmPassword.clearValidators();
      this.acceptTerms.clearValidators();
      this.confirmPassword.setValue('');
      this.acceptTerms.setValue(false);
    }

    this.confirmPassword.updateValueAndValidity({ emitEvent: false });
    this.acceptTerms.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  submit(mode: AuthMode) {
    this.serverError.set(null);
    this.setMode(mode);

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    const email = this.email.value.trim();
    const password = this.password.value;

    const req$ =
      mode === 'login'
        ? this.auth.login({ email, password })
        : this.auth.register({ email, password });

    req$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.serverError.set(extractErrorMessage(err));
      },
    });
  }
}
