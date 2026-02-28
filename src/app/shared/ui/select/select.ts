import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectOption<T = any> = {
  label: string;
  value: T;
  disabled?: boolean;
};

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent<T = any> implements ControlValueAccessor {
  @Input({ required: true }) options: Array<SelectOption<T>> = [];
  @Input() placeholder = 'Select...';
  @Input() label = ''; // опционально, если хочешь лейбл сверху
  @Input() searchable = true;
  @Input() disabled = false;

  /** Как сравнивать значения (если value — объект) */
  @Input() compareWith: (a: T | null, b: T | null) => boolean = (a, b) => a === b;

  /** Если нужно отдать наружу событие изменения */
  @Output() selectionChange = new EventEmitter<T | null>();

  @ViewChild('trigger') triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') searchRef?: ElementRef<HTMLInputElement>;
  @ViewChild('list') listRef?: ElementRef<HTMLDivElement>;

  open = false;
  value: T | null = null;

  query = '';
  activeIndex = -1;

  // CVA
  private onChange: (v: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): SelectOption<T> | null {
    return this.options.find((o) => this.compareWith(o.value, this.value)) ?? null;
  }

  get filteredOptions(): Array<SelectOption<T>> {
    const q = this.query.trim().toLowerCase();
    if (!this.searchable || !q) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(q));
  }

  // --------- UI actions ----------
  toggle() {
    if (this.disabled) return;
    this.open ? this.close() : this.openDropdown();
  }

  openDropdown() {
    if (this.disabled) return;
    this.open = true;

    // активный пункт: выбранный в отфильтрованном списке
    queueMicrotask(() => {
      if (this.searchable) {
        this.searchRef?.nativeElement.focus();
      } else {
        this.triggerRef?.nativeElement.focus();
      }

      this.syncActiveIndex();
      this.scrollActiveIntoView();
    });
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.query = '';
    this.activeIndex = -1;

    queueMicrotask(() => this.triggerRef?.nativeElement.focus());
  }

  selectOption(opt: SelectOption<T>) {
    if (this.disabled || opt.disabled) return;

    this.value = opt.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);

    this.close();
  }

  clearSelection(e?: Event) {
    e?.stopPropagation();
    if (this.disabled) return;
    this.value = null;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.close();
  }

  // --------- Keyboard ----------
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.moveActive(1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.moveActive(-1);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = this.filteredOptions[this.activeIndex];
      if (opt) this.selectOption(opt);
      return;
    }
  }

  moveActive(delta: number) {
    const opts = this.filteredOptions;
    if (!opts.length) {
      this.activeIndex = -1;
      return;
    }

    let i = this.activeIndex;
    if (i < 0) i = 0;

    // прокрутка по кругу + пропуск disabled
    for (let step = 0; step < opts.length; step++) {
      i = (i + delta + opts.length) % opts.length;
      if (!opts[i].disabled) break;
    }

    this.activeIndex = i;
    this.scrollActiveIntoView();
  }

  onSearchInput(value: string) {
    this.query = value;
    this.syncActiveIndex();
    queueMicrotask(() => this.scrollActiveIntoView());
  }

  private syncActiveIndex() {
    const opts = this.filteredOptions;

    // сначала пытаемся подсветить выбранный
    const selectedIdx =
      this.value === null ? -1 : opts.findIndex((o) => this.compareWith(o.value, this.value));

    if (selectedIdx >= 0 && !opts[selectedIdx]?.disabled) {
      this.activeIndex = selectedIdx;
      return;
    }

    // иначе первый не disabled
    this.activeIndex = opts.findIndex((o) => !o.disabled);
  }

  private scrollActiveIntoView() {
    const list = this.listRef?.nativeElement;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${this.activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  // --------- Click outside ----------
  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(e: MouseEvent) {
    if (!this.open) return;
    const target = e.target as Node | null;
    const root = this.triggerRef?.nativeElement?.closest('[data-select-root]');
    if (root && target && !root.contains(target)) this.close();
  }

  // --------- CVA ----------
  writeValue(v: T | null): void {
    this.value = v;
  }
  registerOnChange(fn: (v: T | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markTouched() {
    this.onTouched();
  }

  // для trackBy
  trackByValue = (_: number, o: SelectOption<T>) => o.value as any;
}
