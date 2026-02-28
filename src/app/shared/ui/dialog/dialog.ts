import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
})
export class Dialog implements AfterViewInit {
  private readonly doc = inject(DOCUMENT);

  @Input({ required: true }) open = false;
  @Input() title = '';
  @Input() description = '';

  @Input() closeOnOverlay = true;
  @Input() closeOnEsc = true;
  @Input() disableBodyScroll = true;
  @Input() persistent = false;

  /** width presets: sm/md/lg */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') closeBtnRef?: ElementRef<HTMLButtonElement>;

  private lastActiveEl: HTMLElement | null = null;
  private prevBodyOverflow: string | null = null;

  ngAfterViewInit(): void {
    if (this.open) this.onOpened();
  }

  ngOnChanges(): void {
    queueMicrotask(() => {
      if (this.open) this.onOpened();
      else this.onClosed();
    });
  }

  get panelWidthClass(): string {
    switch (this.size) {
      case 'sm':
        return 'sm:max-w-md';
      case 'lg':
        return 'sm:max-w-3xl';
      default:
        return 'sm:max-w-xl';
    }
  }

  private onOpened() {
    if (!this.panelRef) return;

    this.lastActiveEl =
      this.doc.activeElement instanceof HTMLElement ? this.doc.activeElement : null;

    if (this.disableBodyScroll) {
      const body = this.doc.body;
      this.prevBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
    }

    const target = this.closeBtnRef?.nativeElement ?? this.panelRef.nativeElement;
    target.focus({ preventScroll: true });
  }

  private onClosed() {
    if (this.disableBodyScroll && this.prevBodyOverflow !== null) {
      this.doc.body.style.overflow = this.prevBodyOverflow;
      this.prevBodyOverflow = null;
    }

    this.lastActiveEl?.focus?.();
    this.lastActiveEl = null;
  }

  requestClose() {
    if (this.persistent) return;
    this.openChange.emit(false);
    this.closed.emit();
  }

  onOverlayClick() {
    if (!this.closeOnOverlay) return;
    this.requestClose();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.open) return;

    if (e.key === 'Escape' && this.closeOnEsc) {
      e.preventDefault();
      this.requestClose();
      return;
    }

    if (e.key === 'Tab') this.trapFocus(e);
  }

  private trapFocus(e: KeyboardEvent) {
    const panel = this.panelRef?.nativeElement;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    );

    if (!focusable.length) {
      e.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.doc.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !panel.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (!active || active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
