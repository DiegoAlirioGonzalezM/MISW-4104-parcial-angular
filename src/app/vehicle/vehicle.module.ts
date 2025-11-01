import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';

@NgModule({
  declarations: [VehicleListComponent],
  imports: [CommonModule, SharedModule],
  exports: [VehicleListComponent],
})
export class VehicleModule {}
