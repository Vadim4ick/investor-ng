import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { Hero } from '@/shared/layouts/hero';
import { UbButtonDirective } from '@/shared/ui/button';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { AppContainerComponent } from '@/shared/layouts/app-container';

type SimulationResult = {
  capital: number;
  finalSalary: number;
  avgInvestPerMonth: number;
  avgSpendPerMonth: number;
};

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Hero,
    UbButtonDirective,
    UbInputDirective,
    UbMoneyInputDirective,
    AppContainerComponent,
  ],
  templateUrl: './simulator-page.html',
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
export class SimulatorPage {
  salary = signal(100000);

  salaryGrowth = 10; // %/год
  spendPercent = 80; // % от ЗП

  years = signal(20); // 1..100
  result = signal<SimulationResult | null>(null);

  salaryGrowthPercent() {
    return ((this.salaryGrowth - 5) / (20 - 5)) * 100;
  }

  spendPercentPercent() {
    const min = 50;
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

  runSimulation() {
    // мини-демо расчёт (заменишь на свою модель)
    const years = this.years();
    const startSalary = this.salary();

    const growth = this.salaryGrowth / 100;
    const spendK = this.spendPercent / 100;

    // допустим доходность инвестиций 8% годовых (пример)
    const investReturn = 0.08;

    let salary = startSalary;
    let capital = 0;

    let totalInvest = 0;
    let totalSpend = 0;

    for (let y = 1; y <= years; y++) {
      // годовая зарплата
      const yearIncome = salary * 12;

      const yearSpend = yearIncome * spendK;
      const yearInvest = yearIncome - yearSpend;

      // капитал растёт + пополнение
      capital = capital * (1 + investReturn) + yearInvest;

      totalInvest += yearInvest;
      totalSpend += yearSpend;

      // рост зп в конце года
      salary = salary * (1 + growth);
    }

    const avgInvestPerMonth = totalInvest / (years * 12);
    const avgSpendPerMonth = totalSpend / (years * 12);

    this.result.set({
      capital: Math.round(capital),
      finalSalary: Math.round(salary),
      avgInvestPerMonth: Math.round(avgInvestPerMonth),
      avgSpendPerMonth: Math.round(avgSpendPerMonth),
    });
  }
}
