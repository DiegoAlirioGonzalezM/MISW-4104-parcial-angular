import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';

@NgModule({
  imports: [CommonModule, TableModule, DividerModule],
  exports: [CommonModule, TableModule, DividerModule],
})
export class SharedModule {}
