import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Hero } from '@/shared/layouts/hero';
import { UbButtonDirective } from '@/shared/ui/button';
import { TranslatePipe } from '@ngx-translate/core';
import { SimulatorCalculation } from '@/modules/simulator-page';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    Hero,
    UbButtonDirective,
    SimulatorCalculation,
  ],
  templateUrl: './simulator-page.html',
})
export class SimulatorPage {}
