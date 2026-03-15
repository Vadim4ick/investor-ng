import { Directive, ElementRef, HostListener, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Directive({
  selector: '[ubMoneyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UbMoneyInputDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UbMoneyInputDirective),
      multi: true,
    },
  ],
})
export class UbMoneyInputDirective implements ControlValueAccessor, Validator {
  @Input() min = 0;
  @Input() max = 10_000_000;

  private value: number | null = null;
  private formatter = new Intl.NumberFormat('ru-RU');

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null): void {
    if (value === null || value === undefined || Number.isNaN(value)) {
      this.value = null;
      this.el.nativeElement.value = '';
      return;
    }

    const clamped = this.clamp(value);
    this.value = clamped;
    this.el.nativeElement.value = this.formatter.format(clamped);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event'])
  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '');

    if (!digits) {
      this.value = null;
      input.value = '';
      this.onChange(null);
      return;
    }

    if (digits.length > 9) {
      digits = digits.slice(0, 9);
    }

    const numeric = parseInt(digits, 10);
    const clamped = this.clamp(numeric);

    this.value = clamped;
    input.value = this.formatter.format(clamped);
    this.onChange(clamped);
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();

    if (this.value === null) {
      this.el.nativeElement.value = '';
      return;
    }

    this.el.nativeElement.value = this.formatter.format(this.value);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return { moneyInvalid: true };
    }

    if (value < this.min) {
      return { min: { min: this.min, actual: value } };
    }

    if (value > this.max) {
      return { max: { max: this.max, actual: value } };
    }

    return null;
  }

  private clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }
}
