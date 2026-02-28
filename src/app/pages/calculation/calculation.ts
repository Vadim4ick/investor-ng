import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import {
  UbPaginationEllipsisComponent,
  UbPaginationDirective,
  UbPaginationContentDirective,
  UbPaginationItemDirective,
  UbPaginationPreviousDirective,
  UbPaginationNextDirective,
  UbPaginationLinkDirective,
} from '@/shared/ui/pagination';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { UbButtonDirective } from '@/shared/ui/button';
import { UbInputDirective } from '@/shared/ui/input';
import { CustomSelectComponent } from '@/shared/ui/select/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';

@Component({
  selector: 'calculation',
  imports: [
    AppContainerComponent,
    UbPaginationEllipsisComponent,
    UbPaginationDirective,
    UbPaginationContentDirective,
    UbPaginationItemDirective,
    UbPaginationPreviousDirective,
    UbPaginationNextDirective,
    UbPaginationLinkDirective,
    Dialog,
    UbButtonDirective,
    ReactiveFormsModule,
    UbInputDirective,
    CustomSelectComponent,
    UbMoneyInputDirective,
  ],
  templateUrl: './calculation.html',
})
export class Calculation {
  open = false;

  options = [
    { label: 'Еда', value: 'food' },
    { label: 'Шоппинг', value: 'shop' },
    { label: 'Квартира', value: 'apartment', disabled: false },
  ];

  cityCtrl = new FormControl<string | null>(null);

  confirm() {
    this.open = false;
  }
}
