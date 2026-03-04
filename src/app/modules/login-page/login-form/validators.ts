import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  // confirm может быть отключён/необязателен в login
  if (!confirm) return null;

  return password === confirm ? null : { passwordMismatch: true };
}
