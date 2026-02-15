import { Component } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';

@Component({
  selector: 'simulator-page',
  imports: [AppContainerComponent],
  templateUrl: './simulator-page.html',
})
export class SimulatorPage {
  selectedTab: string = 'paycheck'; // Активная вкладка

  salary: number = 100000; // Начальное значение ЗП
  expenses = {
    food: 20000, // Траты на еду/кафе
    car: 25000, // Траты на машину
    gadgets: 5000, // Траты на гаджеты
    vacation: 10000, // Траты на отпуск
    investments: 20000, // Траты на инвестиции
  };

  // Функция для смены вкладки
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
