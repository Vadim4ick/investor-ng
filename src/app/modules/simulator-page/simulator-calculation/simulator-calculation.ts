import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { UbButtonDirective } from '@/shared/ui/button';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import { TranslatePipe } from '@ngx-translate/core';
import { UbTabsComponent } from '@/shared/ui/tabs/tabs';

type SimulationResult = {
  capital: number;
  finalSalary: number;
  avgInvestPerMonth: number;
  avgSpendPerMonth: number;
  inflation: number;
};

type TabId = 'live' | 'invest';

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
  salary = signal(100000);

  salaryGrowth = 10; // %/год
  spendPercent = 80; // % от ЗП

  years = signal(20); // 1..100
  inflation = signal(1); // 1..100

  result = signal<SimulationResult | null>(null);

  activeTab = signal<TabId>('live');

  tabItems = [
    { id: 'live', label: 'ПРОЖИТЬ' },
    { id: 'invest', label: 'ИНВЕСТИРОВАТЬ' },
  ] as { id: TabId; label: string }[];

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
    const startSalary = this.salary();

    const salaryGrowth = this.salaryGrowth / 100; // номинальный рост ЗП
    const spendK = this.spendPercent / 100;

    const investReturn = 0.08; // номинальная доходность
    const infl = this.inflation() / 100; // годовая инфляция

    // Реальная доходность (Fisher)
    const realReturn = (1 + investReturn) / (1 + infl) - 1;

    let salaryNominal = startSalary; // номинальная зп по годам
    let capitalReal = 0; // капитал в "деньгах сегодняшнего года"

    let totalInvestReal = 0;
    let totalSpendReal = 0;

    for (let y = 1; y <= years; y++) {
      const yearIncomeNominal = salaryNominal * 12;
      const yearSpendNominal = yearIncomeNominal * spendK;
      const yearInvestNominal = yearIncomeNominal - yearSpendNominal;

      // Переводим потоки этого года в реальные деньги
      const df = 1 / Math.pow(1 + infl, y);
      const yearSpendReal = yearSpendNominal * df;
      const yearInvestReal = yearInvestNominal * df;

      // Капитал ведём в реальных деньгах
      capitalReal = capitalReal * (1 + realReturn) + yearInvestReal;

      totalInvestReal += yearInvestReal;
      totalSpendReal += yearSpendReal;

      // Номинальный рост зп в конце года
      salaryNominal = salaryNominal * (1 + salaryGrowth);
    }

    // Финальная зп тоже лучше показать в реальных деньгах (на конец горизонта, но в ценах "сегодня")
    const salaryReal = salaryNominal / Math.pow(1 + infl, years);

    const avgInvestPerMonthReal = totalInvestReal / (years * 12);
    const avgSpendPerMonthReal = totalSpendReal / (years * 12);

    this.result.set({
      capital: Math.round(capitalReal),
      finalSalary: Math.round(salaryReal),
      avgInvestPerMonth: Math.round(avgInvestPerMonthReal),
      avgSpendPerMonth: Math.round(avgSpendPerMonthReal),
      inflation: this.inflation(),
    });
  }
}
