import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export type UbTabItem = {
  id: string;
  label: string;
  iconTpl?: TemplateRef<unknown>;
  disabled?: boolean;
};

@Component({
  selector: 'ub-tabs',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.html',
})
export class UbTabsComponent {
  @Input({ required: true }) items: UbTabItem[] = [];
  @Input({ required: true }) active!: string;
  @Output() activeChange = new EventEmitter<string>();

  setActive(id: string) {
    if (id === this.active) return;
    const item = this.items.find((x) => x.id === id);
    if (!item || item.disabled) return;

    this.active = id;
    this.activeChange.emit(id);
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End')
      return;

    e.preventDefault();

    const enabled = this.items.filter((x) => !x.disabled);
    if (!enabled.length) return;

    const idx = enabled.findIndex((x) => x.id === this.active);
    const last = enabled.length - 1;

    let next = idx;
    if (e.key === 'ArrowRight') next = idx < last ? idx + 1 : 0;
    if (e.key === 'ArrowLeft') next = idx > 0 ? idx - 1 : last;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;

    this.setActive(enabled[next].id);
  }
}
