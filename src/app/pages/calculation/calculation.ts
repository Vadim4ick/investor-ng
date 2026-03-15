import { Component, inject } from '@angular/core';
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
import { UbButtonDirective } from '@/shared/ui/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModalCreateTransaction } from '@/modules/calculation-page';
import { CalculationFacade } from './facade/calculation.facade';
import { TransactionsCacheService } from '@/shared/cache/transactions-cache.service';
import { formatAmount, isIncome } from '@/shared/lib/utils';
import { SummaryFacade } from './facade/summary.facade';

@Component({
  selector: 'calculation',
  imports: [
    AppContainerComponent,
    UbPaginationEllipsisComponent,
    UbPaginationDirective,
    UbPaginationContentDirective,
    UbPaginationItemDirective,
    DatePipe,
    UbPaginationPreviousDirective,
    UbPaginationNextDirective,
    UbPaginationLinkDirective,
    UbButtonDirective,
    ReactiveFormsModule,
    ModalCreateTransaction,
  ],
  templateUrl: './calculation.html',
  providers: [CalculationFacade, SummaryFacade, TransactionsCacheService],
})
export class Calculation {
  readonly facade = inject(CalculationFacade);
  readonly summaryFacade = inject(SummaryFacade);

  readonly formatAmount = formatAmount;
  readonly isIncome = isIncome;

  ngOnInit(): void {
    this.facade.init();
    this.summaryFacade.init();
  }
}
