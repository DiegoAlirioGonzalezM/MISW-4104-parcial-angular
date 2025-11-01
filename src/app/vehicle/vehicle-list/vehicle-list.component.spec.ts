import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { of } from 'rxjs';

import { VehicleModule } from '../vehicle.module';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService } from '../vehicle.service';
import { Vehicle } from '../vehicle';

describe('VehicleListComponent', () => {


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, VehicleModule],
    }).compileComponents();
  });


});
