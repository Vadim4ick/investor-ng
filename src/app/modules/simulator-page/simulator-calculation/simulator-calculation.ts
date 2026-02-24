import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { UbButtonDirective } from '@/shared/ui/button';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UbTabsComponent } from '@/shared/ui/tabs/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

type SimulationResult = {
  capital: number;
  finalSalary: number;
  avgInvestPerMonth: number;
  avgSpendPerMonth: number;
  inflation: number;
};

type TabId = 'live' | 'invest';
type ReinvestMode = 'reinvest' | 'payout';

@Component({
  selector: 'app-simulator-calculation',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    UbButtonDirective,
    UbInputDirective,
    UbMoneyInputDirective,
    AppContainerComponent,
    UbTabsComponent,
  ],
  templateUrl: './simulator-calculation.html',
  animations: [
    trigger('resultEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.98)', filter: 'blur(6px)' }),
        animate(
          '320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }),
        ),
      ]),
    ]),
  ],
})
export class SimulatorCalculation {
  private translate = inject(TranslateService);

  salary = signal(100000);

  salaryGrowth = 10; // %/год
  spendPercent = 80; // % от ЗП

  years = signal(20); // 1..100
  inflation = signal(1); // 1..100

  investReturn = signal(8); // % годовых (диапазон, например 0..30)
  reinvestMode = signal<ReinvestMode>('reinvest');

  investReturnPercent() {
    const min = 0;
    const max = 30;
    return ((this.investReturn() - min) / (max - min)) * 100;
  }

  setInvestReturn(value: any) {
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(30, Math.max(0, Math.round(n))) : 8;
    this.investReturn.set(clamped);
  }

  setReinvestMode(v: ReinvestMode) {
    this.reinvestMode.set(v);
  }

  result = signal<SimulationResult | null>(null);

  activeTab = signal<TabId>('live');

  tabItems = toSignal(
    this.translate.stream(['simulator.tabs.live.title', 'simulator.tabs.invest.title']).pipe(
      map((t) => [
        { id: 'live' as const, label: t['simulator.tabs.live.title'] },
        { id: 'invest' as const, label: t['simulator.tabs.invest.title'] },
      ]),
    ),
    { initialValue: [] as { id: TabId; label: string }[] },
  );

  constructor() {
    effect(() => {
      this.activeTab(); // зависимость

      this.result.set(null); // сброс при любом изменении activeTab
    });
  }

  setActiveTab(id: string) {
    this.activeTab.set(id as TabId);
  }

  salaryGrowthPercent() {
    return ((this.salaryGrowth - 0) / (20 - 0)) * 100;
  }

  spendPercentPercent() {
    const min = 10;
    const max = 100;
    return ((this.spendPercent - min) / (max - min)) * 100;
  }

  setYears(value: any) {
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(100, Math.max(1, Math.round(n))) : 20;
    this.years.set(clamped);
  }

  yearsLabel() {
    const n = this.years();
    // 1 год, 2-4 года, 5-20 лет...
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'лет';
    if (mod10 === 1) return 'год';
    if (mod10 >= 2 && mod10 <= 4) return 'года';
    return 'лет';
  }

  setInflation(value: number) {
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(100, Math.max(1, Math.round(n))) : 1;
    this.inflation.set(clamped);
  }

  runSimulation() {
    const years = this.years();
    const startSalaryMonthly = this.salary();

    const salaryGrowth = this.salaryGrowth / 100; // %/год
    const spendK = this.spendPercent / 100; // доля трат
    const infl = this.inflation() / 100; // %/год

    const isInvestTab = this.activeTab() === 'invest';
    const mode = this.reinvestMode(); // 'reinvest' | 'payout'

    const investReturnNominal = isInvestTab ? this.investReturn() / 100 : 0;
    const realReturn = isInvestTab ? (1 + investReturnNominal) / (1 + infl) - 1 : 0;

    let salaryMonthlyNominal = startSalaryMonthly;

    let capitalReal = 0; // остаток капитала (в ценах "сегодня")
    let payoutReal = 0; // суммарно снятая доходность (в ценах "сегодня")

    let totalInvestReal = 0; // сумма взносов (реальная)
    let totalSpendReal = 0; // сумма трат (реальная)

    for (let y = 1; y <= years; y++) {
      // Номинальные годовые потоки
      const yearIncomeNominal = salaryMonthlyNominal * 12;
      const yearSpendNominal = yearIncomeNominal * spendK;
      const yearInvestNominal = yearIncomeNominal - yearSpendNominal;

      // Приведение к "сегодняшним" ценам
      const df = 1 / Math.pow(1 + infl, y);
      const yearSpendReal = yearSpendNominal * df;
      const yearInvestReal = yearInvestNominal * df;

      totalSpendReal += yearSpendReal;
      totalInvestReal += yearInvestReal;

      // Обновление капитала
      if (isInvestTab) {
        if (mode === 'reinvest') {
          // Реинвест: тело растёт и от доходности, и от взносов
          capitalReal = capitalReal * (1 + realReturn) + yearInvestReal;
        } else {
          // Payout: доходность снимаем, тело растёт только от взносов
          const incomeThisYearReal = capitalReal * realReturn;
          payoutReal += incomeThisYearReal;
          capitalReal = capitalReal + yearInvestReal;
        }
      } else {
        // Live: просто копим (доходность 0)
        capitalReal = capitalReal + yearInvestReal;
      }

      // Рост зарплаты на следующий год
      salaryMonthlyNominal = salaryMonthlyNominal * (1 + salaryGrowth);
    }

    // Финальная ЗП в реальных рублях (в ценах "сегодня")
    const finalSalaryReal = salaryMonthlyNominal / Math.pow(1 + infl, years);

    const avgInvestPerMonthReal = totalInvestReal / (years * 12);
    const avgSpendPerMonthReal = totalSpendReal / (years * 12);

    // ВАЖНО:
    // - capitalReal в режиме payout == сумма взносов (в реале), поэтому совпадает с live
    // - разница payout режима — это payoutReal (снятый доход), поэтому выводим totalCapital
    const shownCapitalReal =
      isInvestTab && mode === 'payout' ? capitalReal + payoutReal : capitalReal;

    this.result.set({
      capital: Math.round(shownCapitalReal),
      finalSalary: Math.round(finalSalaryReal),
      avgInvestPerMonth: Math.round(avgInvestPerMonthReal),
      avgSpendPerMonth: Math.round(avgSpendPerMonthReal),
      inflation: this.inflation(),
    });
  }
}
