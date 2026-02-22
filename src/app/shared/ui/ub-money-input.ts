import { Directive, ElementRef, HostListener, Input, forwardRef, signal } from '@angular/core';
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

  private internalValue = signal<number>(0);

  private formatter = new Intl.NumberFormat('ru-RU');

  constructor(private el: ElementRef<HTMLInputElement>) {}

  // ---- ControlValueAccessor ----

  private onChange = (value: number) => {};
  private onTouched = () => {};

  writeValue(value: number): void {
    if (typeof value !== 'number') return;
    this.internalValue.set(this.clamp(value));
    this.render();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  // ---- Input handling ----

  @HostListener('input', ['$event'])
  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let digits = input.value.replace(/\D/g, '');

    if (!digits) {
      this.internalValue.set(0);
      input.value = '';
      this.onChange(0);
      return;
    }

    // ❗ защита от огромных чисел
    if (digits.length > 9) {
      digits = digits.slice(0, 9); // до 999 999 999
    }

    const numeric = parseInt(digits, 10);
    const clamped = this.clamp(numeric);

    this.internalValue.set(clamped);
    this.onChange(clamped);

    input.value = this.formatter.format(clamped);
  }

  @HostListener('blur')
  handleBlur() {
    this.onTouched();
    this.render(); // перерендер после clamp
  }

  private clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }

  private render() {
    this.el.nativeElement.value =
      this.internalValue() > 0 ? this.formatter.format(this.internalValue()) : '';
  }

  // ---- Validator ----

  validate(control: AbstractControl): ValidationErrors | null {
    const value = this.internalValue();

    if (value < this.min) {
      return { min: true };
    }

    if (value > this.max) {
      return { max: true };
    }

    return null;
  }
}
